import { useAppSelector } from "@/redux/hooks";
import { getReport } from "@/services/reportService";
import {
  Document,
  Image,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API_BASE_URL from "@/config/apiConfig";

const statusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "#2d6a4f";
    case "rejected":
      return "#b91c1c";
    default:
      return "#92400e";
  }
};

const statusBg = (status: string) => {
  switch (status) {
    case "approved":
      return "#e6f4ea";
    case "rejected":
      return "#fce8e8";
    default:
      return "#fef3c7";
  }
};

const MyDocument = ({ report }: { report: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Traffic Violation Report</Text>
        </View>
        <View
          style={[styles.badge, { backgroundColor: statusBg(report?.status) }]}
        >
          <Text
            style={[styles.badgeText, { color: statusColor(report?.status) }]}
          >
            {report?.status?.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Image + Plate */}
      <View style={styles.row}>
        <View style={styles.imageContainer}>
          <Image
            src={`${API_BASE_URL}/${report?.image}`}
            style={styles.image}
          />
        </View>
        <View style={styles.plateContainer}>
          <Text style={styles.label}>NUMBER PLATE</Text>
          <View style={styles.plate}>
            <Text style={styles.plateText}>
              {report?.number_plate?.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.label}>VIOLATION</Text>
          <Text style={styles.value}>
            {report?.violation?.replace(/_/g, " ")}
          </Text>
          <Text style={styles.label}>DATE REPORTED</Text>
          <Text style={styles.value}>
            {report?.createdAt
              ? new Date(report.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "N/A"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Incident Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>LOCATION</Text>
          <Text style={styles.value}>
            {report?.location?.name ?? "Unknown"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>COORDINATES</Text>
          <Text style={styles.value}>
            {report?.location?.latitude}, {report?.location?.longitude}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>DESCRIPTION</Text>
          <Text style={styles.value}>{report?.description}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Report ID: {report?._id}</Text>
        <Text style={styles.footerText}>
          Generated on: {new Date().toLocaleDateString()}
        </Text>
      </View>
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  subtitle: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
  row: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 8,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    borderRadius: 6,
  },
  plateContainer: {
    flex: 1,
    gap: 8,
  },
  plate: {
    backgroundColor: "#C50000",
    borderRadius: 4,
    padding: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  plateText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  label: {
    fontSize: 9,
    color: "#999",
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 12,
    color: "#333",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 12,
  },
  detailRow: {
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  footerText: {
    fontSize: 9,
    color: "#999",
  },
});

const PdfViewer = () => {
  const { token } = useAppSelector((state) => state.auth);
  const { id } = useParams();

  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["report", id],
    queryFn: () => getReport(token!, id!),
    enabled: !!token && !!id,
  });

  if (isLoading) return <p className="p-10 text-center">Loading...</p>;
  if (error) return <p className="text-red-500">{(error as Error).message}</p>;

  return (
    <div className="w-full h-screen">
      <PDFViewer width="100%" height="100%">
        <MyDocument report={report} />
      </PDFViewer>
    </div>
  );
};

export default PdfViewer;
