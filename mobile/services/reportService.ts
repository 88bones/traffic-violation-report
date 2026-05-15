import API_BASE_URL from "@/config/apiConfig";

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
