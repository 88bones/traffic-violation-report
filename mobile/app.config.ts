import os from "os";

const getLocalNetworkIp = () => {
  const interfaces = os.networkInterfaces();
  const preferredNames = [
    "en0",
    "en1",
    "en2",
    "bridge100",
    "Wi-Fi",
    "Ethernet",
  ];

  for (const name of preferredNames) {
    const iface = interfaces[name];
    const address = iface?.find(
      (entry) => entry.family === "IPv4" && !entry.internal,
    )?.address;

    if (address) return `http://${address}:3000`;
  }

  for (const iface of Object.values(interfaces)) {
    const address = iface?.find(
      (entry) => entry.family === "IPv4" && !entry.internal,
    )?.address;

    if (address) return `http://${address}:3000`;
  }

  return "http://localhost:3000";
};

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || "http://localhost:3000";
const androidApiBaseUrl =
  process.env.EXPO_PUBLIC_ANDROID_API_BASE_URL?.trim() || getLocalNetworkIp();

export default {
  expo: {
    name: "mobile",
    slug: "mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.x88bones.mobile",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      softwareKeyboardLayoutMode: "resize",
      googleServicesFile: "./google-services.json",
      package: "com.x88bones.mobile",
      usesCleartextTraffic: true,
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
      ],
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: { backgroundColor: "#000000" },
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone",
          recordAudioAndroid: true,
          barcodeScannerEnabled: false,
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow $(PRODUCT_NAME) to access your gallery",
          colors: { cropToolbarColor: "#000000" },
          dark: { colors: { cropToolbarColor: "#000000" } },
        },
      ],
      ["expo-notifications"],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      apiBaseUrl,
      androidApiBaseUrl,
      eas: {
        projectId: "75c6332e-bac2-4709-8817-2758638d4b31",
      },
    },
    owner: "88bones",
  },
};
