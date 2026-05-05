import Constants from "expo-constants";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ?? "http://192.168.1.65:3000";

export default API_BASE_URL;
