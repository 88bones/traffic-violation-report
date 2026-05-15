import { useAppSelector } from "@/redux/hooks";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  FocusMode,
} from "expo-camera";
import { useRef, useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Fontisto from "@expo/vector-icons/Fontisto";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function Index() {
  const router = useRouter();

  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [zoom, setZoom] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number }>();
  const lastZoom = useRef(0);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  //camera zoom
  const onPinchGesture = (event: PinchGestureHandlerGestureEvent) => {
    const { scale } = event.nativeEvent;
    const newZoom = Math.min(
      Math.max(lastZoom.current + (scale - 1) / 10, 0),
      1,
    );
    setZoom(newZoom);
    lastZoom.current = newZoom;
  };

  //ontap focus
  const handleTapFocus = (e: any) => {
    const { X, Y } = e.nativeEvent;
    setFocusPoint({ x: X, y: Y });
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  //take picture
  const takePicture = async () => {
    if (cameraRef.current) {
      const options = {
        shutterSound: false,
        quality: 0.8,
      };

      const photo = await cameraRef.current.takePictureAsync(options);
      if (photo?.uri) {
        router.push({
          pathname: "/preview",
          params: { image: photo.uri },
        });
      }
    }
  };

  //image picker
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
      router.push({
        pathname: "/preview",
        params: { image: result.assets[0].uri },
      });
    }
  };

  return (
    <PinchGestureHandler onGestureEvent={onPinchGesture}>
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing={facing}
          autofocus="on"
          ratio="4:3"
          zoom={zoom}
          focusable={true}
          ref={cameraRef}
          onTouchEnd={handleTapFocus}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <MaterialIcons name="cameraswitch" size={48} color={"white"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Fontisto name="record" size={58} color={"white"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <MaterialIcons name="photo-library" size={48} color={"white"} />
          </TouchableOpacity>
        </View>

        <View style={styles.dashboard}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
            <FontAwesome name="home" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </PinchGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 64,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    width: "100%",
  },
  button: {
    flex: 1,
    alignItems: "center",
  },
  dashboard: {
    position: "absolute",
    top: 64,
    right: 0,
    backgroundColor: "transparent",
    padding: 16,
  },
});
