import { useLocation } from "@/hooks/useLocation";
import { useAppSelector } from "@/redux/hooks";
import { MapPin } from "lucide-react";
import { useEffect } from "react";

// const headers = ["#", "Name", "Email", "Phone"];

const DashBoard = () => {
  const { token } = useAppSelector((state) => state.auth);
  const { getLocation, locationName, isLocating } = useLocation();

  // console.log(locationName);

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">DashBoARD</h1>
      {isLocating && <p>Getting location...</p>}
      {locationName && <p>{locationName.split("-")[0].trim()}</p>}
    </div>
  );
};

export default DashBoard;
