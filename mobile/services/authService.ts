import axios from "axios";
import { User } from "../types/types";
import API_BASE_URL from "../config/apiConfig";

export const signUp = async (data: Partial<User>) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};
