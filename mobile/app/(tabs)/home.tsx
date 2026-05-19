import { COLORS } from "@/constant/colors";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect } from "react";
import { setReportLoading, setReports } from "@/redux/reportSlice";
import { getReports } from "@/services/reportService";

export default function HomeScreen() {
  const { user, token } = useAppSelector((state) => state.auth);
  const { reports, isLoading } = useAppSelector((state) => state.reports);
  const isRehydrated = useAppSelector(
    (state) => (state.auth as any)._persist?.rehydrated,
  );
  const dispatch = useAppDispatch();
  console.log(user);

  useEffect(() => {
    if (!isRehydrated || !token) return;
    fetchReports();
  }, [isRehydrated, token]);

  const fetchReports = async () => {
    dispatch(setReportLoading(true));
    try {
      const data = await getReports(token!);
      dispatch(setReports(data));
      console.log(data);
    } catch (err: any) {
      Alert.alert("Error", err.message);
      console.log(err);
    } finally {
      dispatch(setReportLoading(false));
    }
  };

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

      {!isLoading && (
        <View>
          <Text>Total Reports: {reports.length}</Text>
        </View>
      )}
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
