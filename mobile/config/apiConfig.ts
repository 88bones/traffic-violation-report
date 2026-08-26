// config/apiConfig.ts
import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiUrl = () => {
  const extra = Constants.expoConfig?.extra;

  // A physical device cannot use localhost to reach the development Mac.
  if (Platform.OS === "ios" && !Constants.isDevice) {
    return extra?.apiBaseUrl ?? "http://localhost:3000";
  }

  return (
    extra?.androidApiBaseUrl ?? extra?.apiBaseUrl ?? "http://localhost:3000"
  );
};

const API_BASE_URL = getApiUrl();
export default API_BASE_URL;
