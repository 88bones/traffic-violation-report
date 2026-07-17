// config/apiConfig.ts
import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiUrl = () => {
  // ← iOS simulator can use localhost
  if (Platform.OS === "ios") {
    return Constants.expoConfig?.extra?.apiBaseUrl ?? "http://localhost:3000";
  }
  // ← Android physical device needs real IP
  return Constants.expoConfig?.extra?.androidApiBaseUrl;
  // ?? "http://192.168.1.65:3000"
};

const API_BASE_URL = getApiUrl();
export default API_BASE_URL;
