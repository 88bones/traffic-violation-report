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
