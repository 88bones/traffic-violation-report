import { COLORS } from "@/constant/colors";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { setReportLoading, setReports } from "@/redux/reportSlice";
import { getReports } from "@/services/reportService";
import ReportCard from "@/components/ReportCard";
import DoughnutChart from "@/components/DoughnutChart";
import { useRouter } from "expo-router";
import { getNotifications } from "@/services/notificationService";
import { setNotifications } from "@/redux/notificationSlice";

export default function HomeScreen() {
  const { user, token } = useAppSelector((state) => state.auth);
  const { reports, isLoading } = useAppSelector((state) => state.reports);
  const { unreadCount } = useAppSelector((state) => state.notifications);

  const isRehydrated = useAppSelector(
    (state) => (state.auth as any)._persist?.rehydrated,
  );
  const dispatch = useAppDispatch();
  //console.log(user);

  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!isRehydrated || !token) return;
    fetchReports();
  }, [isRehydrated, token]);

  const fetchReports = async () => {
    dispatch(setReportLoading(true));
    try {
      const data = await getReports(token!);
      dispatch(setReports(data));
    } catch (err: any) {
      Alert.alert("Error", err.message);
      console.log(err);
    } finally {
      dispatch(setReportLoading(false));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getReports(token!);
      const notification = await getNotifications(token!);
      dispatch(setReports(data));
      dispatch(
        setNotifications({
          notifications: notification.notifications,
          unreadCount: notification.unreadCount,
        }),
      );
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
    setTimeout(() => setRefreshing(false), 1000);
  };

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(token!);
      dispatch(
        setNotifications({
          notifications: data.notifications,
          unreadCount: data.unreadCount,
        }),
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Hi, {user?.name.split(" ")[0]}</Text>
          <MaterialCommunityIcons
            name={unreadCount ? "bell-badge" : "bell-outline"}
            size={24}
            color={COLORS.blue}
            style={styles.notification}
            onPress={() => router.push("/(tabs)/notifications")}
          />
        </View>

        {!isLoading && (
          <>
            <ReportCard reports={reports} />
            <DoughnutChart reports={reports} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.light,
  },
  scrollContainer: {},
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
  notification: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 60,
  },
});
