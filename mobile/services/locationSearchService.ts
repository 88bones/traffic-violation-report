import axios from "axios";

export const searchLocation = async (query: string) => {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: `${query}, Nepal`,
        format: "json",
        countrycodes: "np",
        limit: 5,
      },
      headers: {
        "Accept-Language": "en",
        "User-Agent": "TrafficViolationReporter/1.0",
      },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};
