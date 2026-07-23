import { COLORS } from "@/constant/colors";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Callout, Circle, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { NEPAL_REGION } from "@/hooks/useLocation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useState } from "react";
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

  const { clusters } = dbscan(validReports, 40, 2);
  console.log(clusters.length);

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.header}>Hotspots</Text>

        {isLoading ? (
          <ActivityIndicator size={24} color={COLORS.blue} />
        ) : (
          <View style={styles.mapContainer}>
            <MapView
              style={StyleSheet.absoluteFillObject}
              initialRegion={NEPAL_REGION}
              minZoomLevel={6}
              maxZoomLevel={18}
            >
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
                              {report.number_plate.toUpperCase()}
                            </Text>
                            <View
                              style={[
                                styles.statusBadge,
                                {
                                  backgroundColor:
                                    report.status === "approved"
                                      ? "#e6f4ea"
                                      : report.status === "rejected"
                                        ? "#fce8e8"
                                        : "#fef3c7",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusText,
                                  {
                                    color:
                                      report.status === "approved"
                                        ? "#2d6a4f"
                                        : report.status === "rejected"
                                          ? "#b91c1c"
                                          : "#92400e",
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
          </View>
        )}
        <View style={styles.legendsContainer}>
          <Text style={styles.legendTitle}>Legends:</Text>
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
      </ScrollView>
      <Text style={styles.legendText}>
        Showing {validReports.length} reports
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.blue,
    marginVertical: 12,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 2,
    position: "relative",
  },
  legendsContainer: {
    backgroundColor: "transparent",
    padding: 12,
    borderRadius: 8,
    position: "absolute",
    top: 60,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "white",
  },
  legendsRow: {
    flexDirection: "column",
    gap: 8,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "white",
  },
  bubble: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    width: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bubbleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  plateText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1a1a2e",
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "700",
  },
  bubbleDivider: {
    height: 0.5,
    backgroundColor: "#e0e0e0",
    marginBottom: 8,
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  violationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  violationText: {
    fontSize: 13,
    color: "#333",
    textTransform: "capitalize",
  },
  locationText: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 11,
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
