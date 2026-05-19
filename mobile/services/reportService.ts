import API_BASE_URL from "@/config/apiConfig";
import { Report } from "@/types/types";

export const createReport = async (formData: FormData, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const getReports = async (token: string): Promise<Report[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data.reports;
  } catch (error) {
    throw error;
  }
};

export const getReport = async (
  token: string,
  reportId: string,
): Promise<Report[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data.report;
  } catch (error) {
    throw error;
  }
};
