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
                <View style={styles.legendContainer}>
                  <Text
                    style={[
                      styles.colorBox,
                      { backgroundColor: pieData[index].color },
                    ]}
                  ></Text>
                  <Text key={index} style={styles.legendText}>
                    {data.label}
                  </Text>
                </View>
              ))}
            </View>
          );
        }}
        data={pieData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
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
