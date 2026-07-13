import Constants from "expo-constants";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ?? "http://localhost:3000";

export default API_BASE_URL;
