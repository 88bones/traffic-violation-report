import { COLORS } from "@/constant/colors";
import { StyleSheet, Text, View } from "react-native";
import MapView from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { NEPAL_BOUNDS, NEPAL_REGION } from "@/hooks/useLocation";

export default function HotspotScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Hotspots</Text>

      <View style={styles.legendsContainer}>
        <Text style={styles.legendTitle}>Legends:</Text>
        <View style={styles.legendsRow}>
          {[
            { label: "Drunk Driving", color: "#b91c1c" },
            { label: "Reckless Driving", color: "#ea580c" },
            { label: "Running Red Light", color: "#ca8a04" },
            { label: "Speeding", color: "#2563eb" },
          ].map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View
                style={[styles.colorIndicator, { backgroundColor: item.color }]}
              />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={NEPAL_REGION}
          minZoomLevel={6}
          maxZoomLevel={18}
        />
      </View>
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
