import { COLORS } from "@/constant/colors";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { NEPAL_REGION } from "@/hooks/useLocation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useState } from "react";
import { getReports } from "@/services/reportService";
import { setReports } from "@/redux/reportSlice";
import { ScrollView } from "react-native-gesture-handler";

const LEGENDS = [
  { label: "Drunk Driving", color: "#b91c1c" },
  { label: "Reckless Driving", color: "#ea580c" },
  { label: "Running Red Light", color: "#ca8a04" },
  { label: "Speeding", color: "#2563eb" },
];

export default function HotspotScreen() {
  const { reports, isLoading } = useAppSelector((state) => state.reports);
  const { token } = useAppSelector((state) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useAppDispatch();

  const validReports = (reports ?? []).filter(
    (r) => r.location?.latitude && r.location?.longitude,
  );

  const getColorForViolation = (violationType: string) => {
    const match = LEGENDS.find(
      (l) => l.label.toLowerCase() === violationType?.toLowerCase(),
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
                    />
                  </View>
                );
              })}
            </MapView>
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
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.blue,
    marginVertical: 12,
  },
  legendsContainer: {
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#334155",
  },
  legendsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
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
    color: "#475569",
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
});
