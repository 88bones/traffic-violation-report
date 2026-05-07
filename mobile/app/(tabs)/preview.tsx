import { COLORS } from "@/constant/colors";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Image,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Violation } from "@/types/types";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MapView from "react-native-maps";

const violations = [
  { label: "Speeding", value: Violation.Speeding },
  { label: "Running Red Light", value: Violation.RunningRedLight },
  { label: "Drunk Driving", value: Violation.DrunkDriving },
  { label: "Reckless Driving", value: Violation.RecklessDriving },
];

export default function PreviewScreen() {
  const { image } = useLocalSearchParams<{ image: string }>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selected, setSelected] = useState<Violation | null>(null);
  const [description, setDescription] = useState("");
  const [mapView, setMapView] = useState<boolean>(false);

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
        </View>

        <View style={styles.form}>
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
            style={styles.input}
            placeholder="Description"
            placeholderTextColor={COLORS.darkblue}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity
            style={styles.locationContainer}
            onPress={() => setMapView(!mapView)}
          >
            <FontAwesome6
              name="location-dot"
              size={24}
              color={COLORS.darkblue}
            />
            <Text style={styles.locationText}>Set location of violation</Text>
          </TouchableOpacity>

          {mapView && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: 28.3949,
                  longitude: 84.124,
                  latitudeDelta: 6.0,
                  longitudeDelta: 6.0,
                }}
                minZoomLevel={6}
                region={{
                  latitude: 28.3949,
                  longitude: 84.124,
                  latitudeDelta: 6.0,
                  longitudeDelta: 6.0,
                }}
                onRegionChange={(region) => {
                  // Clamp to Nepal bounds
                  const nepalBounds = {
                    minLat: 26.3,
                    maxLat: 30.4,
                    minLng: 80.0,
                    maxLng: 88.2,
                  };
                  if (
                    region.latitude < nepalBounds.minLat ||
                    region.latitude > nepalBounds.maxLat ||
                    region.longitude < nepalBounds.minLng ||
                    region.longitude > nepalBounds.maxLng
                  ) {
                    // snap back to Nepal
                  }
                }}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  imageContainer: { width: "100%", height: 300, paddingHorizontal: 16 },
  image: { width: "100%", height: "100%", resizeMode: "contain" },
  form: { padding: 16, gap: 12 },
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
  dropdownItemText: { color: COLORS.darkblue },
  input: {
    borderWidth: 1,
    borderColor: COLORS.darkblue,
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#fff",
    minHeight: 100,
    textAlignVertical: "top",
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
    height: 200,
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
});
