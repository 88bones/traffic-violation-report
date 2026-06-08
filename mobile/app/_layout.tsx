import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import { persistor, store } from "@/redux/store";
import { useAppSelector } from "@/redux/hooks";
import { PersistGate } from "redux-persist/integration/react";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { registerForPushNotifications } from "@/services/pushNotificationService";
import * as Notifications from "expo-notifications";

function RouteGuard() {
  const router = useRouter();
  const segments = useSegments();
  const [mounted, setMounted] = useState(false);

  const { user, token } = useAppSelector((state) => state.auth);

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inCameraGroup = segments[0] === "(camera)";

    if (!user && !token && !inAuthGroup) {
      router.replace("/(auth)/signin");
    } else if (user && token && !inTabsGroup && !inCameraGroup) {
      router.replace("/(tabs)/home");
    }
  }, [mounted, user, token, segments]);

  useEffect(() => {
    if (!token || !user) return;

    registerForPushNotifications(token);

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
        router.push("/(tabs)/notifications");
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [token, user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(camera)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
          <RouteGuard />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
