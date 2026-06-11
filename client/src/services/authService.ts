import axios from "axios";
import type { User } from "@/types/types";
import API_BASE_URL from "../config/apiConfig";

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
      localStorage.setItem("authToken", res.data.token);
    }

    return res.data;
  } catch (err) {
    throw err;
  }
};

export const fetchUserProfile = async (userId: string) => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.get(`${API_BASE_URL}/api/auth/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getUsers = async (token: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/auth/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err) {
    throw err;
  }
};

export const logout = () => {
  localStorage.removeItem("authToken");
};
