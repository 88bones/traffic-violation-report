import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { useAppSelector } from "@/redux/hooks";

function RouteGuard() {
  const router = useRouter();
  const { user, token, isLoading } = useAppSelector((state) => state.auth);
  const segments = useSegments();
  const [mounted, setMounted] = useState(false); // ← add this

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!user && !token && !inAuthGroup) {
      router.replace("/(auth)/signin");
    } else if (user && token && !inTabsGroup) {
      router.replace("/(tabs)");
    }
  }, [mounted, user, token, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RouteGuard />
    </Provider>
  );
}
