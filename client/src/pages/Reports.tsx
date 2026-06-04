import { useAppSelector } from "@/redux/hooks";
import { getReports } from "@/services/reportService";
import { useQuery } from "@tanstack/react-query";

const Reports = () => {
  const { token } = useAppSelector((state) => state.auth);

  const {
    data: reports,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reports"],
    queryFn: () => getReports(token!),
    enabled: !!token,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <div>
      <h1>Reports</h1>
      {reports &&
        reports.map((report) => <p key={report._id}>{report.description}</p>)}
    </div>
  );
};

export default Reports;
