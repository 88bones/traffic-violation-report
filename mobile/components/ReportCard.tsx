import { COLORS } from "@/constant/colors";
import { Report } from "@/types/types";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ReportCardProps {
  reports: Report[];
}

export default function ReportCard({ reports }: ReportCardProps) {
  const total = reports.length;
  const pending = reports.filter((r) => r.status === "pending").length;
  const approved = reports.filter((r) => r.status === "approved").length;
  const rejected = reports.filter((r) => r.status === "rejected").length;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Report Stats</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: "#e8f0fe" }]}>
          <Text style={[styles.statNumber, { color: "#1a73e8" }]}>{total}</Text>
          <Text style={[styles.statLabel, { color: "#1a73e8" }]}>Total</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#fef3c7" }]}>
          <Text style={[styles.statNumber, { color: "#92400e" }]}>
            {pending}
          </Text>
          <Text style={[styles.statLabel, { color: "#92400e" }]}>Pending</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#e6f4ea" }]}>
          <Text style={[styles.statNumber, { color: "#2d6a4f" }]}>
            {approved}
          </Text>
          <Text style={[styles.statLabel, { color: "#2d6a4f" }]}>Approved</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#fce8e8" }]}>
          <Text style={[styles.statNumber, { color: "#b91c1c" }]}>
            {rejected}
          </Text>
          <Text style={[styles.statLabel, { color: "#b91c1c" }]}>Rejected</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.darkblue,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statNumber: { fontSize: 28, fontWeight: "bold" },
  statLabel: { fontSize: 13, fontWeight: "500", marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.darkblue,
    marginBottom: 8,
  },
});
