import axios from "axios";
import API_BASE_URL from "../config/apiConfig";
import { Report } from "../types/types";

export const createReport = async (formData: FormData, token: string) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/reports`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};
