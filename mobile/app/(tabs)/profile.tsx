import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/slice";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/(auth)/signin");
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={styles.container}>
      <Text>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
