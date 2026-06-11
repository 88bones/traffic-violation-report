import { COLORS } from "@/constant/colors";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  markNotificationRead,
  setNotifications,
} from "@/redux/notificationSlice";
import { getNotifications, markAsRead } from "@/services/notificationService";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const { token } = useAppSelector((state) => state.auth);
  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notifications,
  );
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(token!);
      dispatch(setNotifications(data));
    } catch (err) {
      console.log(err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(token!, id);
      dispatch(markNotificationRead(id));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.isRead && styles.unread]}
            onPress={() => handleMarkRead(item._id)}
            activeOpacity={0.8}
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name={item.isRead ? "notifications-outline" : "notifications"}
                size={22}
                color={item.isRead ? "#999" : COLORS.blue}
              />
            </View>
            <View style={styles.content}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {!item.isRead && <View style={styles.dot} />}
          </TouchableOpacity>
        )}
      />
      <View style={styles.dashboard}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
          <FontAwesome name="home" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 24, fontWeight: "bold", color: COLORS.darkblue },
  badge: {
    backgroundColor: COLORS.blue,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  list: { padding: 12, gap: 8 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  unread: {
    borderColor: COLORS.blue,
    backgroundColor: "#f0f5ff",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1 },
  notifTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkblue,
    marginBottom: 2,
  },
  message: { fontSize: 13, color: "#666", lineHeight: 18 },
  date: { fontSize: 11, color: "#999", marginTop: 4 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.blue,
    marginTop: 4,
  },
  empty: { alignItems: "center", marginTop: 80, gap: 12 },
  emptyText: { fontSize: 14, color: "#999" },
  dashboard: {
    position: "absolute",
    bottom: 20,
    right: 0,
    backgroundColor: COLORS.blue,
    borderRadius: 50,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 1,
  },
});
