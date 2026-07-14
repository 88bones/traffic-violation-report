import {
  Document,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { useParams } from "react-router-dom";

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
  const { id } = useParams();
  console.log(id);

  return (
    <PDFViewer>
      <MyDocument />
    </PDFViewer>
  );
};

export default PdfViewer;
