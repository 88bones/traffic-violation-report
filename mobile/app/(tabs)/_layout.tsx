import { Tabs, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constant/colors";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useAppSelector } from "@/redux/hooks";

function CameraButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push("/(camera)")}
      style={styles.buttonContainer}
    >
      <View style={styles.button}>
        <Ionicons name="camera" size={30} color={COLORS.blue} />
      </View>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const { unreadCount } = useAppSelector((state) => state.notifications);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Report",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "clipboard" : "clipboard-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="camera-placeholder"
        options={{
          title: "",
          tabBarButton: () => <CameraButton />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "medal" : "medal-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarStyle: { display: "none" },
          href: null,
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <Ionicons
                name={focused ? "notifications" : "notifications-outline"}
                size={size}
                color={color}
              />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  {/* <Text style={styles.badgeText}>{unreadCount}</Text> */}
                </View>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    borderTopWidth: 0,
    elevation: 0,
    position: "relative",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    zIndex: 1,
    borderRadius: 40,
    padding: 4,
    backgroundColor: COLORS.light,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 1,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "red",
    borderRadius: 999,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
});
