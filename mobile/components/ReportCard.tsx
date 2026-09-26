import { COLORS } from "@/constant/colors";
import { Report } from "@/types/types";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface ReportCardProps {
  reports: Report[];
}

interface StatItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: number;
  label: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}

const StatCard = ({
  icon,
  value,
  label,
  bgColor,
  borderColor,
  iconBg,
  iconColor,
}: StatItemProps) => (
  <View style={[styles.statCard, { backgroundColor: bgColor, borderColor }]}>
    <View style={styles.cardHeader}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.statNumber}>{value}</Text>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function ReportCard({ reports }: ReportCardProps) {
  const total = reports.length;
  const pending = reports.filter((r) => r.status === "pending").length;
  const approved = reports.filter((r) => r.status === "approved").length;
  const rejected = reports.filter((r) => r.status === "rejected").length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.headerDot} />
          <Text style={styles.header}>Report Overview</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>{total} Total</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="file-document-multiple-outline"
          value={total}
          label="Total Reports"
          bgColor="#F0F7FF"
          borderColor="#BFDBFE"
          iconBg="#DBEAFE"
          iconColor="#1D4ED8"
        />
        <StatCard
          icon="clock-time-four-outline"
          value={pending}
          label="Pending"
          bgColor="#FFFBEB"
          borderColor="#FDE68A"
          iconBg="#FEF3C7"
          iconColor="#D97706"
        />
        <StatCard
          icon="check-circle-outline"
          value={approved}
          label="Approved"
          bgColor="#F0FDF4"
          borderColor="#BBF7D0"
          iconBg="#DCFCE7"
          iconColor="#15803D"
        />
        <StatCard
          icon="close-circle-outline"
          value={rejected}
          label="Rejected"
          bgColor="#FEF2F2"
          borderColor="#FECACA"
          iconBg="#FEE2E2"
          iconColor="#DC2626"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.blue,
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  totalBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  totalBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.blue,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    flexGrow: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
});
