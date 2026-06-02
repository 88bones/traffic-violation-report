import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { createReport, updateReport } from "@/services/reportService";
import { setReports } from "@/redux/reportSlice";
import { Violation } from "@/types/types";

export function useReportForm() {
  const { token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [numberPlate, setNumberPlate] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Violation | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (
    image: string,
    pin: { latitude: number; longitude: number },
    locationName: string,
  ) => {
    if (!numberPlate || !selected || !description || !pin || !image) {
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
          latitude: pin.latitude,
          longitude: pin.longitude,
          name: locationName,
        }),
      );
      formData.append("image", {
        uri: image,
        name: "report.jpg",
        type: "image/jpeg",
      } as any);

      await createReport(formData as any, token!);
      Alert.alert("Success", "Report submitted successfully.");
      router.replace("/(tabs)/home");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (
    reportId: string,
    image: string,
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
    handleCreate,
    handleUpdate,
  };
}
