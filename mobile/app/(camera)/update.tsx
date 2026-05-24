import { useAppSelector } from "@/redux/hooks";
import { COLORS } from "@/constant/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Violation, Report } from "@/types/types";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MapView, { Marker, Region } from "react-native-maps";
import { searchLocation } from "@/services/locationSearchService";
import { createReport } from "@/services/reportService";
import API_BASE_URL from "@/config/apiConfig";

const violations = [
  { label: "Speeding", value: Violation.Speeding },
  { label: "Running Red Light", value: Violation.RunningRedLight },
  { label: "Drunk Driving", value: Violation.DrunkDriving },
  { label: "Reckless Driving", value: Violation.RecklessDriving },
];

const NEPAL_REGION: Region = {
  latitude: 28.3949,
  longitude: 84.124,
  latitudeDelta: 6.0,
  longitudeDelta: 6.0,
};

const NEPAL_BOUNDS = {
  minLat: 26.3,
  maxLat: 30.4,
  minLng: 80.0,
  maxLng: 88.2,
};

export default function UpdateScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const report = useAppSelector((state) =>
    state.reports.reports.find((r) => r._id === reportId),
  );
  console.log(report);

  const [isExpanded, setIsExpanded] = useState(false);

  const [mapView, setMapView] = useState<boolean>(!!report?.location);
  const [search, setSearch] = useState<string>(report?.location?.name || "");
  const [results, setResults] = useState<any[]>([]);
  const [description, setDescription] = useState(report?.description || "");
  const [numberPlate, setNumberPlate] = useState(report?.number_plate || "");
  const [location, setLocation] = useState(report?.location?.name || "");
  const [pin, setPin] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: report?.location?.latitude || 0,
    longitude: report?.location?.longitude || 0,
  });
  const [image, setImage] = useState(`${API_BASE_URL}/${report?.image}` || "");
  const [selected, setSelected] = useState<Violation | null>(
    (report?.violation as Violation) ?? null,
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "padding" : "height"}
      style={styles.keyboard}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Number Plate"
            placeholderTextColor={COLORS.darkblue}
            value={numberPlate}
            onChangeText={setNumberPlate}
          />

          {/* Dropdown */}
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={styles.dropdownText}>
              {selected ?? "Select Violation"}
            </Text>
            <Text>{isExpanded ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.dropdownList}>
              {violations.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelected(item.value);
                    setIsExpanded(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Description */}
          <TextInput
            style={[styles.input, styles.descrption]}
            placeholder="Description"
            placeholderTextColor={COLORS.darkblue}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Location */}
          <View style={styles.locationContainer}>
            <FontAwesome6
              name="location-dot"
              size={24}
              color={COLORS.darkblue}
            />
            <TextInput
              style={styles.locationText}
              placeholder="Search for location"
              placeholderTextColor={COLORS.darkblue}
              value={search}
              //   onChangeText={handleSearch}
            />
          </View>

          {/* Results dropdown */}
          {results.length > 0 && (
            <View style={styles.resultsList}>
              {results.map((item) => (
                <TouchableOpacity
                  key={item.place_id}
                  style={styles.resultItem}
                  //   onPress={() => selectLocation(item)}
                >
                  <Text style={styles.resultText} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {mapView && (
            <View style={styles.mapContainer}>
              <MapView
                // ref={mapRef}
                style={styles.map}
                initialRegion={NEPAL_REGION}
                minZoomLevel={6}
                maxZoomLevel={15}
                // onRegionChangeComplete={onRegionChangeComplete}
              >
                {pin && (
                  <Marker
                    coordinate={pin}
                    title="Violation Location"
                    pinColor="red"
                  />
                )}
              </MapView>
            </View>
          )}
          {/* <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            {isLoading ? (
              <ActivityIndicator size={24} color={COLORS.blue} />
            ) : (
              <Text style={styles.buttonText}>Submit Report</Text>
            )}
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    width: "100%",
    backgroundColor: COLORS.light,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    paddingHorizontal: 16,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  form: {
    padding: 16,
    gap: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.darkblue,
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  dropdownText: { color: COLORS.darkblue },
  dropdownList: {
    borderWidth: 1,
    borderColor: COLORS.darkblue,
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownItemText: {
    color: COLORS.darkblue,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.darkblue,
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#fff",
    // minHeight: 100,
    textAlignVertical: "top",
  },
  descrption: {
    minHeight: 100,
  },
  locationContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.darkblue,
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#fff",
  },
  locationText: { color: COLORS.darkblue },
  mapContainer: {
    width: "100%",
    height: 300,
    borderWidth: 1,
    borderColor: COLORS.darkblue,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  resultsList: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.darkblue,
    overflow: "hidden",
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultText: {
    color: COLORS.darkblue,
    fontSize: 13,
  },
  button: {
    backgroundColor: COLORS.blue,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.light,
  },
});
