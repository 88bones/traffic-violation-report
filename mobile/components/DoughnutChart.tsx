import { COLORS } from "@/constant/colors";
import { Report } from "@/types/types";
import { StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface DoughnutChartProps {
  reports: Report[];
}

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
      color: "#2563EB",
      text: `${speedingPct}%`,
      label: "Speeding",
      icon: "speedometer",
    },
    {
      value: runningRedLight,
      color: "#D97706",
      text: `${redLightPct}%`,
      label: "Red Light",
      icon: "traffic-light",
    },
    {
      value: drunkDriving,
      color: "#DC2626",
      text: `${drunkPct}%`,
      label: "Drunk Driving",
      icon: "glass-cocktail",
    },
    {
      value: recklessDriving,
      color: "#EA580C",
      text: `${recklessPct}%`,
      label: "Reckless",
      icon: "car-speed-limiter",
    },
  ].filter((item) => item.value > 0);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.headerDot} />
          <Text style={styles.header}>Violation Breakdown</Text>
        </View>
      </View>

      {pieData.length > 0 ? (
        <>
          <View style={styles.chartContainer}>
            <PieChart
              donut
              radius={110}
              textSize={14}
              innerRadius={70}
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
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons
              name="chart-donut-variant"
              size={42}
              color={COLORS.blue}
            />
          </View>
          <Text style={styles.emptyTitle}>No Violations Logged</Text>
          <Text style={styles.emptySubtitle}>
            When traffic violations are recorded, category charts and distributions will appear here.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D97706",
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  centerLabel: {
    alignItems: "center",
    justifyContent: "center",
  },
  totalCount: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.darkblue,
  },
  totalLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  legendsContainer: {
    gap: 10,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    borderRadius: 12,
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
  legendRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.darkblue,
    minWidth: 26,
    textAlign: "right",
  },
  legendPercent: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    minWidth: 40,
    textAlign: "right",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 280,
  },
});
