import { Tabs } from "expo-router";
import { COLORS } from "@/constant/colors";

export default function CameraLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "index",
          tabBarStyle: { display: "none" },
          headerShown: false,
          href: null,
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
          href: null,
        }}
      />
      <Tabs.Screen
        name="update"
        options={{
          title: "Update Report",
          tabBarStyle: { display: "none" },
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.light },
          headerTintColor: COLORS.darkblue,
          headerTitleStyle: { fontWeight: "600" },
          headerShadowVisible: false,
          href: null,
        }}
      />
    </Tabs>
  );
}
