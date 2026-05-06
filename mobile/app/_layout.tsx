import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider } from "react-redux";
import { store } from "../redux/store";

function RouteGuard() {
  const router = useRouter();

  const [user, setUser] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        setUser(!!token);
      } catch (err) {
        setUser(false);
      }
      setIsReady(true);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (!user) {
      router.replace("/(auth)/signin");
    }
  }, [isReady, user, router]);

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
