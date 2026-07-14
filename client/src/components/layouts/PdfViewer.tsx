import { useAppSelector } from "@/redux/hooks";
import { getReport } from "@/services/reportService";
import {
  Document,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const MyDocument = () => (
  <Document>
    <Page size={"A4"} style={styles.page}>
      <View style={styles.section}>
        <Text>pdf view</Text>
      </View>
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

const PdfViewer = () => {
  const { token } = useAppSelector((state) => state.auth);

  const { id } = useParams();
  console.log(id);

  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reports"],
    queryFn: () => getReport(token!, id!),
    enabled: !!token,
  });

  if (isLoading) return <p className="p-10 text-center">Loading...</p>;
  if (error) return <p className="text-red-500">{(error as Error).message}</p>;

  console.log(report);

  return (
    <PDFViewer>
      <MyDocument />
    </PDFViewer>
  );
};

export default PdfViewer;
