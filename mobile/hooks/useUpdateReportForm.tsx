import { useState } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { updateReport } from "@/services/reportService";
import * as ImagePicker from "expo-image-picker";
import API_BASE_URL from "@/config/apiConfig";
import { Violation } from "@/types/types";

export function useUpdateReportForm() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const { token } = useAppSelector((state) => state.auth);
  const report = useAppSelector((state) =>
    state.reports.reports.find((r) => r._id === reportId),
  );
  const router = useRouter();

  const [numberPlate, setNumberPlate] = useState(report?.number_plate || "");
  const [description, setDescription] = useState(report?.description || "");
  const [selected, setSelected] = useState<Violation | null>(
    (report?.violation as Violation) ?? null,
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(`${API_BASE_URL}/${report?.image}` || "");

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async (
    pin: { latitude: number; longitude: number },
    locationName: string,
  ) => {
    if (!numberPlate || !selected || !description || !pin) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("number_plate", numberPlate);
      formData.append("violation", selected);
      formData.append("description", description);
      formData.append(
        "location",
        JSON.stringify({
          name: locationName,
          latitude: pin.latitude,
          longitude: pin.longitude,
        }),
      );
      formData.append("image", {
        uri: image,
        name: "report.jpg",
        type: "image/jpeg",
      } as any);

      await updateReport(token!, reportId, formData as any);
      Alert.alert("Success", "Report updated successfully.");
      router.replace("/(tabs)/reports");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Something went wrong.",
      );
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    numberPlate,
    setNumberPlate,
    description,
    setDescription,
    selected,
    setSelected,
    isExpanded,
    setIsExpanded,
    isLoading,
    image,
    setImage,
    pickImage,
    handleSubmit,
  };
}
