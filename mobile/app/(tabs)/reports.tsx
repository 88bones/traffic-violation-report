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
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { deleteReport, getReports } from "@/services/reportService";
import { removeReport, setReports } from "@/redux/reportSlice";
import { ComponentProps } from "react";
import { useRouter } from "expo-router";

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
  const { token } = useAppSelector((state) => state.auth);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const router = useRouter();


  const actionButtons = [
    {
      id: "close-btn",
      icon: "close",
      color: COLORS.blue,
      onPress: () => setModalVisible(false),
    },
    {
      id: "trash-btn",
      icon: "trash",
      color: "#c70202",
      onPress: () => handleDelete(selectedReport?._id!),
    },
    {
      id: "pencil-btn",
      icon: "pencil",
      color: "#02C72D",
      onPress: () =>
        router.push({
          pathname: "/(camera)/update",
          params: { reportId: selectedReport?._id! },
        }),
    },
  ];

  const handlePress = (item: Report) => {
    setSelectedReport(item);
    setModalVisible(true);
  };

  const handleDelete = async (reportId: string) => {
    Alert.alert("Delete Report", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReport(token!, reportId);
            dispatch(removeReport(reportId));
            setModalVisible(false);
          } catch (error) {
            Alert.alert("Error", "Failed to delete report");
          }
        },
      },
    ]);
  };

  //handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getReports(token!);
      dispatch(setReports(data));
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
    setTimeout(() => setRefreshing(false), 1000);
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
          refreshing={refreshing}
          onRefresh={handleRefresh}
          keyExtractor={(item) => item._id}
        />
      )}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Image with overlay buttons */}
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: `${API_BASE_URL}/${selectedReport?.image}` }}
                style={styles.modalImage}
              />
              {/* <View style={styles.overlay} /> */}

              {/* Buttons */}
              <View style={styles.actionButtons}>
                {actionButtons.map((btn) => (
                  <TouchableOpacity
                    key={btn.id}
                    style={styles.iconBtn}
                    onPress={btn.onPress}
                  >
                    <Ionicons
                      name={btn.icon as ComponentProps<typeof Ionicons>["name"]}
                      size={20}
                      color={btn.color}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Status badge on image */}
              <View style={styles.imageBadgeWrapper}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: statusStyle(
                        selectedReport?.status ?? "pending",
                      ).background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: statusStyle(selectedReport?.status ?? "pending")
                          .text,
                      },
                    ]}
                  >
                    {selectedReport?.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalBody}>
              {/* Number plate */}
              <View style={styles.plateContainer}>
                <Text style={styles.plateLabel}>Number Plate</Text>
                <Text style={styles.plateText}>
                  {selectedReport?.number_plate}
                </Text>
              </View>

              {/* Violation + Date row */}
              <View style={styles.infoRow}>
                <View style={styles.infoBox}>
                  <Text style={styles.label}>Violation</Text>
                  <Text style={styles.infoText}>
                    {selectedReport?.violation?.replace(/_/g, " ")}
                  </Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.label}>Date</Text>
                  <Text style={styles.infoText}>
                    {selectedReport
                      ? new Date(selectedReport.createdAt).toLocaleDateString()
                      : ""}
                  </Text>
                </View>
              </View>

              {/* Location */}
              <View style={styles.infoBoxFull}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.infoText}>
                  {selectedReport?.location?.name ?? "Unknown"}
                </Text>
              </View>

              {/* Description */}
              <View style={styles.infoBoxFull}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.descriptionText}>
                  {selectedReport?.description}
                </Text>
              </View>
            </View>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  imageWrapper: {
    width: "100%",
    height: 220,
    position: "relative",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  actionButtons: {
    position: "absolute",
    top: 12,
    right: 12,
    gap: 8,
    flexDirection: "column",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageBadgeWrapper: {
    position: "absolute",
    bottom: 12,
    left: 12,
  },
  modalBody: { padding: 20, gap: 12 },
  plateContainer: {
    backgroundColor: "#C50000",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  plateLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  plateText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
    letterSpacing: 2,
  },
  infoRow: { flexDirection: "row", gap: 12 },
  infoBox: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
  },
  infoBoxFull: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
  },
  label: {
    fontSize: 11,
    color: "gray",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textTransform: "capitalize",
  },
  descriptionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});
