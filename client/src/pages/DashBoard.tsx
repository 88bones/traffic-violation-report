import { useLocation } from "@/hooks/useLocation";
import { useAppSelector } from "@/redux/hooks";
import { MapPin } from "lucide-react";

const headers = ["#", "Name", "Email", "Phone"];

const DashBoard = () => {
  const { token } = useAppSelector((state) => state.auth);
  const { getLocation, location, locationName, isLocating } = useLocation();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">DashBoARD</h1>
      <button
        onClick={getLocation}
        disabled={isLocating}
        className="flex items-center gap-2 px-4 py-2 border rounded-md"
      >
        {isLocating ? (
          <span>Getting location...</span>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            <span>{locationName || "Get current location"}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default DashBoard;
