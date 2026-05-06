import axios from "axios";
import { User } from "../types/types";
import API_BASE_URL from "../config/apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const signUp = async (data: Partial<User>) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const signin = async (data: Partial<User>) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/signin`, data);
    if (res.data.token) {
      try {
        await AsyncStorage.setItem("authToken", res.data.token);
      } catch (storageErr) {
        console.warn("Failed to save token to AsyncStorage:", storageErr);
      }
    }
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const fetchUserProfile = async (userId: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/auth/profile/${userId}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};
