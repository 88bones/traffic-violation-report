import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";

function RouteGuard() {
  const router = useRouter();

  const [user, setUser] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (!user) {
      router.replace("/(auth)/signup");
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
  return <RouteGuard />;
}
