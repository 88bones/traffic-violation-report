import { COLORS, StatusColors } from "@/constant/colors";
import { Report } from "@/types/types";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API_BASE_URL from "@/config/apiConfig";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppSelector } from "@/redux/hooks";

const statusStyle = (status: string) => {
  switch (status) {
    case "approved":
      return StatusColors.approved;

    case "rejected":
      return StatusColors.rejected;

    default:
      return StatusColors.pending;
  }
};
const Item = ({ item, onPress }: { item: Report; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Image
          source={{ uri: `${API_BASE_URL}/${item.image}` }}
          style={styles.image}
        />
        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.plate}>{item.number_plate}</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: statusStyle(item.status).background },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: statusStyle(item.status).text },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.violation}>
            <Feather name="alert-triangle" size={14} color="#a3081a" />{" "}
            {item.violation.replace(/_/g, " ")}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            <FontAwesome6 name="location-pin" size={14} color="black" />{" "}
            {item.location?.name ?? "Unknown"}
          </Text>
          <Text style={styles.date}>
            <Fontisto name="date" size={14} color="gray" />{" "}
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.divider} />
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function ReportScreen() {
  const { reports, isLoading } = useAppSelector((state) => state.reports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const handlePress = (item: Report) => {
    setSelectedReport(item);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Reports</Text>
      {isLoading ? (
        <ActivityIndicator size={24} color={COLORS.blue} />
      ) : (
        <FlatList
          data={reports}
          renderItem={({ item }) => (
            <Item item={item} onPress={() => handlePress(item)} />
          )}
          keyExtractor={(item) => item._id}
        />
      )}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={{
                alignSelf: "flex-end",
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                borderRadius: 50,
                padding: 4,
                position: "absolute",
                top: 25,
                right: 25,
                zIndex: 10,
              }}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={28} color="#c70202" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignSelf: "flex-end",
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                borderRadius: 50,
                padding: 4,
                position: "absolute",
                top: 65,
                right: 25,
                zIndex: 10,
              }}
              // onPress={() => setModalVisible(false)}
            >
              <Ionicons name="trash" size={28} color="#008f0a" />
            </TouchableOpacity>
            <Image
              source={{ uri: `${API_BASE_URL}/${selectedReport?.image}` }}
              style={styles.modalImage}
            />
            <Text>{selectedReport?.number_plate}</Text>
            <Text>{selectedReport?.violation}</Text>
            <Text>{selectedReport?.description}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 20,
    backgroundColor: COLORS.light,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.blue,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
    marginVertical: 8,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  info: { flex: 1 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  plate: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.darkblue,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: "500" },
  violation: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  location: { fontSize: 13, color: "#666", marginBottom: 4 },
  date: { fontSize: 12, color: "#999" },
  divider: { height: 0.5, backgroundColor: "#e0e0e0" },
  description: { fontSize: 13, color: "#666", padding: 10 },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
});
