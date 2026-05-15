import { COLORS } from "@/constant/colors";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Report() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Reports</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 20,
    backgroundColor: COLORS.light,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.blue,
  },
});
