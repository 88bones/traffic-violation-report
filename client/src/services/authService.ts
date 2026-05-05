import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface SignUpData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const signUp = async (data: SignUpData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const login = async (data: LoginData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const logout = async () => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/logout`);
    return res.data;
  } catch (err) {
    throw err;
  }
};
