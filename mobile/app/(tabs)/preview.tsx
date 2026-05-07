import { COLORS } from "@/constant/colors";
import { useLocalSearchParams } from "expo-router";
import { Image, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PreviewScreen() {
  const { image } = useLocalSearchParams<{ image: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.light,
  },
  image: { width: "100%", height: "100%", resizeMode: "contain" },
});
