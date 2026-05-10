import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constant/colors";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarStyle: { display: "none" },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="preview"
        options={{
          title: "New Report",
          tabBarStyle: { display: "none" },
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.light },
          headerTintColor: COLORS.darkblue,
          headerTitleStyle: { fontWeight: "600" },
          headerShadowVisible: false,
        }}
      />
    </Tabs>
  );
}
