import { COLORS } from "@/constant/colors";
import { useAppSelector } from "@/redux/hooks";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function HomeScreen() {
  const { user } = useAppSelector((state) => state.auth);
  console.log(user);

  // const fetchReportLengths=async()=>{
  //   setIsL
  // }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Hi, {user?.name.split(" ")[0]}</Text>
        <MaterialCommunityIcons
          name="bell-outline"
          size={24}
          color={COLORS.blue}
        />
      </View>
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
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.blue,
  },
});
