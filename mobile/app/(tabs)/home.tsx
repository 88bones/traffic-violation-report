import { COLORS } from "@/constant/colors";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState, useRef } from "react";
import { setReportLoading, setReports } from "@/redux/reportSlice";
import { getReports } from "@/services/reportService";
import ReportCard from "@/components/ReportCard";
import DoughnutChart from "@/components/DoughnutChart";
import { useRouter } from "expo-router";
import { getNotifications } from "@/services/notificationService";
import { setNotifications } from "@/redux/notificationSlice";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const { user, token } = useAppSelector((state) => state.auth);
  const { reports, isLoading } = useAppSelector((state) => state.reports);
  const { unreadCount } = useAppSelector((state) => state.notifications);

  const isRehydrated = useAppSelector(
    (state) => (state.auth as any)._persist?.rehydrated,
  );
  const dispatch = useAppDispatch();
  console.log("Token: ", token);

  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const router = useRouter();

  useEffect(() => {
    if (!isRehydrated || !token) return;
    fetchReports();
  }, [isRehydrated, token]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    <View style={styles.container}>
      <LinearGradient
        colors={["#014BAA", "#0367D3", "#014BAA"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back</Text>
              <Text style={styles.heading}>{user?.name.split(" ")[0]} 👋</Text>
            </View>
            <View style={styles.notificationContainer}>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
              <MaterialCommunityIcons
                name={unreadCount ? "bell" : "bell-outline"}
                size={26}
                color="#fff"
                onPress={() => router.push("/(tabs)/notifications")}
              />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {!isLoading && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <ReportCard reports={reports} />
            <DoughnutChart reports={reports} />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
    marginBottom: 4,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  notificationContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#014BAA",
    zIndex: 1,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
});
