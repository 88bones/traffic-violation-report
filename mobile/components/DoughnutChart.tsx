import { COLORS } from "@/constant/colors";
import { Report } from "@/types/types";
import { StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

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
      color: "#177AD5",
      text: `${speedingPct}%`,
      label: "Speeding",
    },
    {
      value: runningRedLight,
      color: "#79D2DE",
      text: `${redLightPct}%`,
      label: "Red Light",
    },
    {
      value: drunkDriving,
      color: "#ED6665",
      text: `${drunkPct}%`,
      label: "Drunk Driving",
    },
    {
      value: recklessDriving,
      color: "#FCD667",
      text: `${recklessPct}%`,
      label: "Reckless",
    },
  ].filter((item) => item.value > 0);
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Violation Stats</Text>
      <View style={{ alignItems: "center" }}>
        <PieChart
          donut
          radius={150}
          textSize={14}
          innerRadius={90}
          showText
          textColor="white"
          centerLabelComponent={() => {
            return (
              <View>
                {pieData.map((data, index) => (
                  <View style={styles.legendContainer} key={index}>
                    <Text
                      style={[
                        styles.colorBox,
                        { backgroundColor: pieData[index].color },
                      ]}
                    ></Text>
                    <Text style={styles.legendText}>{data.label}</Text>
                  </View>
                ))}
              </View>
            );
          }}
          data={pieData}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.darkblue,
    marginBottom: 12,
  },
  colorBox: {
    width: 15,
    height: 15,
  },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  legendText: {
    fontSize: 16,
    fontWeight: "semibold",
  },
});
