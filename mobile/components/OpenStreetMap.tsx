import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import WebView, { type WebViewMessageEvent } from "react-native-webview";

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export type MapRegion = MapCoordinate & {
  latitudeDelta: number;
  longitudeDelta: number;
};

export type OpenStreetMapMarker = {
  coordinate: MapCoordinate;
  color?: string;
  title?: string;
  details?: string[];
};

export type OpenStreetMapCircle = {
  center: MapCoordinate;
  radius: number;
  color: string;
  fillColor: string;
  fillOpacity?: number;
  strokeWidth?: number;
};

type OpenStreetMapProps = {
  initialRegion: MapRegion;
  region?: MapRegion;
  markers?: OpenStreetMapMarker[];
  circles?: OpenStreetMapCircle[];
  style?: StyleProp<ViewStyle>;
  onMapReady?: () => void;
  onRegionChangeComplete?: (region: MapRegion) => void;
};

const LEAFLET_HTML = `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }
    body { overflow: hidden; }
    .report-marker { border: 2px solid white; border-radius: 50%; box-shadow: 0 1px 4px #0008; }
    .leaflet-popup-content { margin: 10px 12px; font: 14px -apple-system, sans-serif; }
    .leaflet-control-attribution { font-size: 10px !important; }
    .cluster-report-list { max-height: 240px; overflow-y: auto; }
    .cluster-report-entry { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .report-cluster-icon {
      background: #2563eb;
      color: #fff;
      border: 2px solid #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-family: -apple-system, sans-serif;
      box-shadow: 0 1px 4px #0008;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
  <script>
    function sendMessage(message) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    }
    window.onerror = function (message) {
      sendMessage({ type: 'error', message: String(message) });
    };
    const map = L.map('map', { zoomControl: true }).setView([28.3949, 84.124], 6);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    const circleLayer = L.layerGroup().addTo(map);
    const markerCluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
      spiderfyOnMaxZoom: false,
      maxClusterRadius: 40,
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        const size = count < 10 ? 32 : count < 25 ? 38 : 44;
        return L.divIcon({
          html: '<div class="report-cluster-icon" style="width:' + size + 'px;height:' + size + 'px;">' + count + '</div>',
          className: '',
          iconSize: [size, size]
        });
      }
    }).addTo(map);
    markerCluster.on('clusterclick', function (event) {
      const childMarkers = event.layer.getAllChildMarkers();
      const reportDetails = childMarkers.map(function (marker) {
        return '<div class="cluster-report-entry">' +
          (marker.getPopup() ? marker.getPopup().getContent() : '') +
          '</div>';
      }).join('');

      L.popup({ maxWidth: 320, maxHeight: 300 })
        .setLatLng(event.latlng)
        .setContent(
          '<strong>' + childMarkers.length + ' reports in this cluster</strong>' +
          '<div class="cluster-report-list">' + reportDetails + '</div>'
        )
        .openOn(map);
    });
    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
      });
    }
    window.updateMapData = function (data) {
      const region = data.region;
      if (region) {
        const zoom = Math.max(3, Math.min(18, Math.log2(360 / region.longitudeDelta)));
        map.setView([region.latitude, region.longitude], zoom, { animate: false });
      }
      circleLayer.clearLayers();
      markerCluster.clearLayers();
      (data.circles || []).forEach(function (circle) {
        L.circle([circle.center.latitude, circle.center.longitude], {
          radius: circle.radius,
          color: circle.color,
          fillColor: circle.fillColor,
          fillOpacity: circle.fillOpacity == null ? 0.2 : circle.fillOpacity,
          weight: circle.strokeWidth == null ? 2 : circle.strokeWidth
        }).addTo(circleLayer);
      });
      const points = [];
      (data.markers || []).forEach(function (marker) {
        const color = marker.color || '#2563eb';
        const point = L.circleMarker(
          [marker.coordinate.latitude, marker.coordinate.longitude],
          { radius: 8, color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 }
        );
        const title = marker.title ? '<strong>' + escapeHtml(marker.title) + '</strong>' : '';
        const details = (marker.details || []).map(function (line) {
          return '<div>' + escapeHtml(line) + '</div>';
        }).join('');
        if (title || details) point.bindPopup(title + details);
        points.push(point);
      });
      markerCluster.addLayers(points);
      map.invalidateSize();
    };
    map.on('moveend', function () {
      const center = map.getCenter();
      const bounds = map.getBounds();
      sendMessage({
        type: 'region',
        region: {
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: bounds.getNorth() - bounds.getSouth(),
          longitudeDelta: bounds.getEast() - bounds.getWest()
        }
      });
    });
    sendMessage({ type: 'ready' });
  </script>
</body>
</html>`;

const serializeForScript = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

export default function OpenStreetMap({
  initialRegion,
  region,
  markers = [],
  circles = [],
  style,
  onMapReady,
  onRegionChangeComplete,
}: OpenStreetMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const mapData = useMemo(
    () =>
      serializeForScript({ region: region ?? initialRegion, markers, circles }),
    [initialRegion, region, markers, circles],
  );

  useEffect(() => {
    if (ready) {
      webViewRef.current?.injectJavaScript(
        `window.updateMapData(${mapData}); true;`,
      );
    }
  }, [mapData, ready]);

  useEffect(() => {
    if (ready || loadError) return;
    const timeout = setTimeout(() => setLoadError(true), 15000);
    return () => clearTimeout(timeout);
  }, [ready, loadError]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === "ready") {
        setReady(true);
        onMapReady?.();
      } else if (message.type === "region") {
        onRegionChangeComplete?.(message.region);
      } else if (message.type === "error") {
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: LEAFLET_HTML }}
        originWhitelist={["*"]}
        javaScriptEnabled
        onMessage={handleMessage}
        onError={() => setLoadError(true)}
        style={styles.webView}
      />
      {!ready && !loadError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.message}>Loading OpenStreetMap...</Text>
        </View>
      )}
      {loadError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.message}>OpenStreetMap could not load.</Text>
          <Text style={styles.errorHint}>Check your internet connection.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  webView: {
    flex: 1,
    backgroundColor: "#eef2f3",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#eef2f3",
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 16,
    backgroundColor: "#eef2f3",
  },
  message: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
  },
  errorHint: {
    color: "#64748b",
    fontSize: 12,
  },
});
