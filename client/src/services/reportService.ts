import API_BASE_URL from "@/config/apiConfig";
import type { Report } from "@/types/types";

export const getReports = async (token: string): Promise<Report[]> => {
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
};

export const patchStatus = async (
  token: string,
  status: string,
  reportId: string,
): Promise<Report[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: status,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }
    return data.reports;
  } catch (err) {
    throw err;
  }
};
