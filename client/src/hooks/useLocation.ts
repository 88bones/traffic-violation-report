import { useState } from "react";

export function useLocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [locationName, setLocationName] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in your browser.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "User-Agent": "TrafficViolationReporter/1.0" } },
          );
          const data = await res.json();
          setLocationName(data.display_name);
        } catch {
          setLocationName(`${latitude}, ${longitude}`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error(error);
        alert("Could not get location");
        setIsLocating(false);
      },
    );
  };
  return {
    location,
    locationName,
    isLocating,
    getLocation,
  };
}
