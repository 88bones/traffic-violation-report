import { useLocation } from "@/hooks/useLocation";
import { useAppSelector } from "@/redux/hooks";
import { useEffect } from "react";
import ReportDonut from "@/components/layouts/ReportDonut";
import { useQuery } from "@tanstack/react-query";
import { getReports } from "@/services/reportService";

// const headers = ["#", "Name", "Email", "Phone"];

const DashBoard = () => {
  const { token } = useAppSelector((state) => state.auth);
  const { getLocation, locationName, isLocating } = useLocation();

  // console.log(locationName);

  useEffect(() => {
    getLocation();
  }, []);

  const {
    data: reports,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reports"],
    queryFn: () => getReports(token!),
    enabled: !!token,
  });

  if (isLoading) return <p className="p-10 text-center">Loading...</p>;
  if (error) return <p className="text-red-500">{(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">DashBoARD</h1>
      {isLocating && <p>Getting location...</p>}
      {locationName && <p>{locationName.split("-")[0].trim()}</p>}
      <ReportDonut reports={reports!} />
    </div>
  );
};

export default DashBoard;
