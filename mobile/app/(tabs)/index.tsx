import { useAppSelector } from "@/redux/hooks";
import { Text, View } from "react-native";

export default function Index() {
  const { user, token } = useAppSelector((state) => state.auth);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Text>{user?.email}</Text>
    </View>
  );
}
