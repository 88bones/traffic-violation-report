import { useRef, useState } from "react";
import { searchLocation } from "@/services/locationSearchService";
import MapView, { Region } from "react-native-maps";
import { InteractionManager } from "react-native";

export const NEPAL_REGION: Region = {
  latitude: 28.3949,
  longitude: 84.124,
  latitudeDelta: 6.0,
  longitudeDelta: 6.0,
};

export const NEPAL_BOUNDS = {
  minLat: 26.3,
  maxLat: 30.4,
  minLng: 80.0,
  maxLng: 88.2,
};

export function useLocation() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [pin, setPin] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationName, setLocationName] = useState("");
  const [mapView, setMapView] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<MapView | null>(null);

  const onRegionChangeComplete = (region: Region) => {
    const isOutside =
      region.latitude < NEPAL_BOUNDS.minLat ||
      region.latitude > NEPAL_BOUNDS.maxLat ||
      region.longitude < NEPAL_BOUNDS.minLng ||
      region.longitude > NEPAL_BOUNDS.maxLng;

    if (isOutside) {
      mapRef.current?.animateToRegion(NEPAL_REGION, 300);
    }
  };

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (query.length < 3) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchLocation(query);
        setResults(res);
      } catch (err: any) {
        if (err?.response?.status === 429) {
          console.log("Too many requests, slow down");
        }
      }
    }, 500);
  };

  const selectLocation = (item: any) => {
    const lat = Number(item.lat ?? item.latitude ?? item.latString);
    const lng = Number(item.lon ?? item.longitude ?? item.lngString);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.warn("selectLocation: invalid coordinates", item);
      return;
    }

    setPin({ latitude: lat, longitude: lng });
    setLocationName(item.display_name ?? item.name ?? "");
    setSearch(item.display_name ?? "");
    setResults([]);
    setMapView(true);

    // Wait until interactions finish so MapView is mounted and ready on Android
    InteractionManager.runAfterInteractions(() => {
      try {
        const animateFn = (mapRef.current as any)?.animateToRegion;
        if (typeof animateFn === "function") {
          animateFn.call(
            mapRef.current,
            {
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            },
            500,
          );
        } else {
          console.warn("animateToRegion not available on mapRef.current");
        }
      } catch (err) {
        console.warn("animateToRegion failed", err);
      }
    });
  };

  return {
    search,
    results,
    pin,
    locationName,
    mapView,
    mapRef,
    handleSearch,
    selectLocation,
    onRegionChangeComplete,
  };
}
