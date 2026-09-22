import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/slice";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { COLORS } from "@/constant/colors";
import { useMemo } from "react";

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { reports } = useAppSelector((state) => state.reports);

  const userReports = useMemo(() => {
    return reports.filter((r) => r.user_id === user?._id);
  }, [reports, user]);

  const stats = useMemo(() => {
    const total = userReports.length;
    const pending = userReports.filter((r) => r.status === "pending").length;
    const approved = userReports.filter((r) => r.status === "approved").length;
    const rejected = userReports.filter((r) => r.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [userReports]);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/(auth)/signin");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>
                {user?.name ? getInitials(user.name) : "U"}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <View style={styles.emailContainer}>
            <MaterialCommunityIcons
              name="email-outline"
              size={16}
              color="#666"
            />
            <Text style={styles.userEmail}>{user?.email || "N/A"}</Text>
          </View>
          {user?.phone && (
            <View style={styles.phoneContainer}>
              <MaterialCommunityIcons name="phone-outline" size={16} color="#666" />
              <Text style={styles.userPhone}>{user.phone}</Text>
            </View>
          )}
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <MaterialCommunityIcons
              name="chart-box-outline"
              size={24}
              color={COLORS.darkblue}
            />
            <Text style={styles.statsTitle}>My Reports</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View
                style={[styles.statIconContainer, { backgroundColor: "#E3F2FD" }]}
              >
                <MaterialCommunityIcons
                  name="file-document-multiple"
                  size={24}
                  color="#1976D2"
                />
              </View>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[styles.statIconContainer, { backgroundColor: "#FFF9E6" }]}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={24}
                  color="#F59E0B"
                />
              </View>
              <Text style={styles.statValue}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[styles.statIconContainer, { backgroundColor: "#E8F5E9" }]}
              >
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color="#388E3C"
                />
              </View>
              <Text style={styles.statValue}>{stats.approved}</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[styles.statIconContainer, { backgroundColor: "#FFEBEE" }]}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={24}
                  color="#D32F2F"
                />
              </View>
              <Text style={styles.statValue}>{stats.rejected}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Account Information</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <MaterialCommunityIcons
                name="account-outline"
                size={20}
                color="#666"
              />
              <Text style={styles.infoLabel}>User ID</Text>
            </View>
            <Text style={styles.infoValue}>{user?._id?.slice(-8) || "N/A"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={20}
                color="#666"
              />
              <Text style={styles.infoLabel}>Role</Text>
            </View>
            <Text style={styles.infoValue}>
              {user?.role?.toUpperCase() || "USER"}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
  header: {
    paddingTop: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 24,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userPhone: {
    fontSize: 14,
    color: "#666",
  },
  statsCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.darkblue,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: "46%",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.darkblue,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
