import { COLORS } from "@/constant/colors";
import { Report } from "@/types/types";
import { StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface DoughnutChartProps {
  reports: Report[];
}

const violationIcons: Record<string, string> = {
  speeding: "speedometer",
  running_red_light: "traffic-light",
  drunk_driving: "glass-cocktail",
  reckless_driving: "car-speed-limiter",
};

export default function DoughnutChart({ reports }: DoughnutChartProps) {
  const total = reports.length;
  const speeding = reports.filter((r) => r.violation === "speeding").length;
  const runningRedLight = reports.filter(
    (r) => r.violation === "running_red_light",
  ).length;
  const drunkDriving = reports.filter(
    (r) => r.violation === "drunk_driving",
  ).length;
  const recklessDriving = reports.filter(
    (r) => r.violation === "reckless_driving",
  ).length;

  const divisor = total === 0 ? 1 : total;

  const speedingPct = Math.round((speeding / divisor) * 100);
  const redLightPct = Math.round((runningRedLight / divisor) * 100);
  const drunkPct = Math.round((drunkDriving / divisor) * 100);
  const recklessPct = Math.round((recklessDriving / divisor) * 100);

  const pieData = [
    {
      value: speeding,
      color: "#2563eb",
      text: `${speedingPct}%`,
      label: "Speeding",
      icon: "speedometer",
    },
    {
      value: runningRedLight,
      color: "#ca8a04",
      text: `${redLightPct}%`,
      label: "Red Light",
      icon: "traffic-light",
    },
    {
      value: drunkDriving,
      color: "#b91c1c",
      text: `${drunkPct}%`,
      label: "Drunk Driving",
      icon: "glass-cocktail",
    },
    {
      value: recklessDriving,
      color: "#ea580c",
      text: `${recklessPct}%`,
      label: "Reckless",
      icon: "car-speed-limiter",
    },
  ].filter((item) => item.value > 0);
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>🚦 Violation Breakdown</Text>
      </View>

      {pieData.length > 0 ? (
        <>
          <View style={styles.chartContainer}>
            <PieChart
              donut
              radius={120}
              textSize={16}
              innerRadius={75}
              showText
              textColor="white"
              fontWeight="bold"
              centerLabelComponent={() => {
                return (
                  <View style={styles.centerLabel}>
                    <Text style={styles.totalCount}>{total}</Text>
                    <Text style={styles.totalLabel}>Total</Text>
                  </View>
                );
              }}
              data={pieData}
            />
          </View>

          <View style={styles.legendsContainer}>
            {pieData.map((data, index) => (
              <View style={styles.legendRow} key={index}>
                <View style={styles.legendLeft}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: data.color },
                    ]}
                  />
                  <MaterialCommunityIcons
                    name={data.icon as any}
                    size={20}
                    color={data.color}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.legendLabel}>{data.label}</Text>
                </View>
                <View style={styles.legendRight}>
                  <Text style={styles.legendValue}>{data.value}</Text>
                  <Text style={styles.legendPercent}>{data.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={64}
            color="#ccc"
          />
          <Text style={styles.emptyText}>No violation data available</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.darkblue,
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  centerLabel: {
    alignItems: "center",
    justifyContent: "center",
  },
  totalCount: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.darkblue,
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  legendsContainer: {
    gap: 12,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 14,
    borderRadius: 12,
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
  },
  legendRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.darkblue,
    minWidth: 30,
    textAlign: "right",
  },
  legendPercent: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    minWidth: 45,
    textAlign: "right",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    marginTop: 12,
  },
});
