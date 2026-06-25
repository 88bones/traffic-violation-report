import API_BASE_URL from "@/config/apiConfig";
import type { Report } from "@/types/types";

export const getNearbyReports = async (
  token: string,
  latitude: number,
  longitude: number,
  radius: number = 40,
): Promise<Report[]> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      `${API_BASE_URL}/api/reports/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
    );
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText);
      if (xhr.status !== 200) reject(new Error(data.message));
      resolve(data.reports);
    };
    xhr.onerror = () => reject(new Error("Network request failed"));
    xhr.send();
  });
};
