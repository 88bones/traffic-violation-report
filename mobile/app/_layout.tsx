import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { presistor, store } from "../redux/store";
import { useAppSelector } from "@/redux/hooks";
import { PersistGate } from "redux-persist/integration/react";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function RouteGuard() {
  const router = useRouter();
  const segments = useSegments();
  const [mounted, setMounted] = useState(false);

  const { user, token, isLoading } = useAppSelector((state) => state.auth);
  const isRehydrated = useAppSelector(
    (state) => state.auth._persist?.rehydrated,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading || isRehydrated) return;

    const inAuthGroup = segments[0] === "(auth)";
    // const inCameraGroup = segments[0] === "(camera)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!user && !token && !inAuthGroup) {
      router.replace("/(auth)/signin");
    } else if (user && token && !inTabsGroup) {
      router.replace("/(tabs)");
    }
  }, [mounted, user, token, isLoading, segments, isRehydrated]);

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
        <PersistGate loading={<ActivityIndicator />} persistor={presistor}>
          <RouteGuard />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
