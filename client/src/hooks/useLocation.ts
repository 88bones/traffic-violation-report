import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setLocation, clearLocation } from "@/redux/locationSlice";
import { useState } from "react";

export function useLocation() {
  const dispatch = useAppDispatch();
  const { latitude, longitude, locationName } = useAppSelector(
    (state) => state.location,
  );
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

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "User-Agent": "TrafficViolationReporter/1.0" } },
          );
          const data = await res.json();
          dispatch(
            setLocation({
              latitude,
              longitude,
              locationName: data.display_name,
            }),  
          );
        } catch {
          dispatch(
            setLocation({
              latitude,
              longitude,
              locationName: `${latitude}, ${longitude}`,
            }),
          );
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
    latitude,
    longitude,
    locationName,
    isLocating,
    getLocation,
    clearLocation: () => dispatch(clearLocation()),
  };
}
