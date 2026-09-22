import { COLORS } from "@/constant/colors";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Callout, Circle, Marker, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { NEPAL_REGION } from "@/hooks/useLocation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useMemo, useState } from "react";
import { getReports } from "@/services/reportService";
import { setReports } from "@/redux/reportSlice";
import { ScrollView } from "react-native-gesture-handler";
import { dbscan } from "@/utils/algorithm";

const LEGENDS = [
  { label: "Drunk Driving", value: "drunk_driving", color: "#b91c1c" },
  { label: "Reckless Driving", value: "reckless_driving", color: "#ea580c" },
  { label: "Running Red Light", value: "running_red_light", color: "#ca8a04" },
  { label: "Speeding", value: "speeding", color: "#2563eb" },
];

export default function HotspotScreen() {
  const { reports, isLoading } = useAppSelector((state) => state.reports);
  const { token } = useAppSelector((state) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useAppDispatch();

  const validReports = (reports ?? []).filter(
    (r) => r.location?.latitude && r.location?.longitude,
  );

  const clusters = useMemo(() => {
    if (!validReports.length) return [];
    const { clusters: calculatedClusters } = dbscan(validReports, 40, 2);
    return calculatedClusters || [];
  }, [validReports]);
  // console.log(clusters.length);

  const getColorForViolation = (violation: string) => {
    const match = LEGENDS.find(
      (l) => l.value.toLowerCase() === violation?.toLowerCase(),
    );
    return match ? match.color : COLORS.blue;
  };

  //refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getReports(token!);
      dispatch(setReports(data));
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>🗺️ Violation Hotspots</Text>
        <Text style={styles.subtitle}>
          {validReports.length} reports • {clusters.length} clusters
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.blue} />
            <Text style={styles.loadingText}>Loading hotspots...</Text>
          </View>
        ) : (
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_DEFAULT}
              style={StyleSheet.absoluteFillObject}
              initialRegion={NEPAL_REGION}
              minZoomLevel={6}
              maxZoomLevel={18}
              mapType={Platform.OS === "android" ? "none" : "standard"}
            >
              {Platform.OS === "android" && (
                <UrlTile
                  urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maximumZ={19}
                  flipY={false}
                  zIndex={-1}
                />
              )}
              {/* clusters */}
              {clusters.map((cluster, i) => {
                const center = {
                  latitude:
                    cluster.reduce((sum, r) => sum + r.location.latitude, 0) /
                    cluster.length,
                  longitude:
                    cluster.reduce((sum, r) => sum + r.location.longitude, 0) /
                    cluster.length,
                };
                return (
                  <Circle
                    key={`cluster-${i}`}
                    center={center}
                    radius={cluster.length * 800}
                    strokeColor="#ff000080"
                    fillColor="#ff000020"
                    strokeWidth={2}
                  />
                );
              })}
              {/* report markers */}
              {validReports.map((report) => {
                const markerColor = getColorForViolation(report.violation);
                return (
                  <View key={report._id}>
                    <Circle
                      center={{
                        latitude: report.location.latitude,
                        longitude: report.location.longitude,
                      }}
                      radius={500}
                      zIndex={2}
                      strokeColor={markerColor}
                      fillColor={`${markerColor}40`}
                      strokeWidth={2}
                    />
                    <Marker
                      coordinate={{
                        latitude: report.location.latitude,
                        longitude: report.location.longitude,
                      }}
                      pinColor={markerColor}
                    >
                      <Callout tooltip={true}>
                        <View style={styles.bubble}>
                          {/* Header */}
                          <View style={styles.bubbleHeader}>
                            <Text style={styles.plateText}>
                              🚗 {report.number_plate.toUpperCase()}
                            </Text>
                            <View
                              style={[
                                styles.statusBadge,
                                {
                                  backgroundColor:
                                    report.status === "approved"
                                      ? "#d4edda"
                                      : report.status === "rejected"
                                        ? "#f8d7da"
                                        : "#fff3cd",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusText,
                                  {
                                    color:
                                      report.status === "approved"
                                        ? "#155724"
                                        : report.status === "rejected"
                                          ? "#721c24"
                                          : "#856404",
                                  },
                                ]}
                              >
                                {report.status.toUpperCase()}
                              </Text>
                            </View>
                          </View>

                          {/* Divider */}
                          <View style={styles.bubbleDivider} />

                          {/* Violation */}
                          <View style={styles.bubbleRow}>
                            <View
                              style={[
                                styles.violationDot,
                                { backgroundColor: markerColor },
                              ]}
                            />
                            <Text style={styles.violationText}>
                              {report.violation.replace(/_/g, " ")}
                            </Text>
                          </View>

                          {/* Location */}
                          <Text style={styles.locationText} numberOfLines={2}>
                            📍 {report.location?.name ?? "Unknown"}
                          </Text>

                          {/* Date */}
                          <Text style={styles.dateText}>
                            🗓 {new Date(report.createdAt).toLocaleDateString()}
                          </Text>

                          {/* Arrow */}
                          <View style={styles.bubbleArrow} />
                        </View>
                      </Callout>
                    </Marker>
                  </View>
                );
              })}
            </MapView>

            <View style={styles.legendsContainer}>
              <View style={styles.legendCard}>
                <Text style={styles.legendTitle}>Violation Types</Text>
                <View style={styles.legendsRow}>
                  {LEGENDS.map((item) => (
                    <View key={item.label} style={styles.legendItem}>
                      <View
                        style={[
                          styles.colorIndicator,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text style={styles.legendText}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  headerContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.darkblue,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  legendsContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
  },
  legendCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    color: COLORS.darkblue,
  },
  legendsRow: {
    flexDirection: "column",
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  legendText: {
    fontSize: 13,
    color: "#1a1a1a",
    fontWeight: "600",
  },
  bubble: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  bubbleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  plateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a2e",
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bubbleDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 12,
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  violationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  violationText: {
    fontSize: 14,
    color: "#1a1a1a",
    textTransform: "capitalize",
    fontWeight: "600",
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    lineHeight: 18,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  bubbleArrow: {
    position: "absolute",
    bottom: -10,
    left: "50%",
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#fff",
  },
});
