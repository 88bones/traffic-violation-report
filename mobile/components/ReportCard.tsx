import { COLORS } from "@/constant/colors";
import { Report } from "@/types/types";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

interface ReportCardProps {
  reports: Report[];
}

const StatCard = ({
  icon,
  value,
  label,
  colors,
  iconColor,
}: {
  icon: string;
  value: number;
  label: string;
  colors: string[];
  iconColor: string;
}) => (
  <LinearGradient colors={colors} style={styles.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
    <View style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}>
      <MaterialCommunityIcons name={icon as any} size={24} color={iconColor} />
    </View>
    <Text style={styles.statNumber}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </LinearGradient>
);

export default function ReportCard({ reports }: ReportCardProps) {
  const total = reports.length;
  const pending = reports.filter((r) => r.status === "pending").length;
  const approved = reports.filter((r) => r.status === "approved").length;
  const rejected = reports.filter((r) => r.status === "rejected").length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>📊 Report Overview</Text>
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          icon="file-document-multiple"
          value={total}
          label="Total Reports"
          colors={["#E3F2FD", "#BBDEFB"]}
          iconColor="#1976D2"
        />
        <StatCard
          icon="clock-outline"
          value={pending}
          label="Pending"
          colors={["#FFF9E6", "#FFF3CD"]}
          iconColor="#F59E0B"
        />
        <StatCard
          icon="check-circle"
          value={approved}
          label="Approved"
          colors={["#E8F5E9", "#C8E6C9"]}
          iconColor="#388E3C"
        />
        <StatCard
          icon="close-circle"
          value={rejected}
          label="Rejected"
          colors={["#FFEBEE", "#FFCDD2"]}
          iconColor="#D32F2F"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.darkblue,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "46%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
});
