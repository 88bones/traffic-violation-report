import TableLayout from "@/components/layouts/TableLayout";
import { useAppSelector } from "@/redux/hooks";
import { getReports } from "@/services/reportService";
import { useQuery } from "@tanstack/react-query";
import type { Report } from "@/types/types";
import { TableCell, TableRow } from "@/components/ui/table";
import API_BASE_URL from "@/config/apiConfig";
// import { Badge } from "@/components/ui/badge";

const statusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

const headers = [
  "#",
  "Image",
  "Number Plate",
  "Violation",
  "Location",
  "Status",
  "Date",
];

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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>
      <TableLayout
        headers={headers}
        data={reports ?? []}
        // caption="All submitted violation reports"
        renderRow={(report: Report, index: number) => (
          <TableRow key={report._id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <img
                src={`${API_BASE_URL}/${report.image}`}
                alt="Report"
                className="h-16 w-16 object-cover rounded cursor-pointer"
                onClick={() =>
                  window.open(`${API_BASE_URL}/${report.image}`, "_blank")
                }
              />
            </TableCell>
            <TableCell className="font-medium">{report.number_plate}</TableCell>
            <TableCell className="capitalize">
              {report.violation.replace(/_/g, " ")}
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {report.location?.name ?? "Unknown"}
            </TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(report.status)}`}
              >
                {report.status}
              </span>
            </TableCell>
            <TableCell>
              {new Date(report.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        )}
      />
    </div>
  );
};

export default Reports;
