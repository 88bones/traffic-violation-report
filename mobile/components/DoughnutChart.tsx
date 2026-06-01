import { View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

export default function DoughnutChart() {
  const pieData = [
    { value: 54, color: "#177AD5", text: "54%" },
    { value: 40, color: "#79D2DE", text: "30%" },
    { value: 20, color: "#ED6665", text: "26%" },
  ];
  return (
    <View>
      <PieChart
        donut
        showText
        textColor="white"
        radius={150}
        textSize={14}
        innerRadius={110}
        // showTextBackground
        // textBackgroundRadius={26}
        data={pieData}
      />
    </View>
  );
}
