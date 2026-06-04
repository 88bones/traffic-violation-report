import TableLayout from "@/components/layouts/TableLayout";
import { useAppSelector } from "@/redux/hooks";
import { getReports } from "@/services/reportService";
import { useQuery } from "@tanstack/react-query";
import type { Report } from "@/types/types";
import { TableCell, TableRow } from "@/components/ui/table";
import API_BASE_URL from "@/config/apiConfig";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchStatus } from "@/services/reportService";

const statuses = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

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
  "Description",
  "Violation",
  "Location",
  "Date",
  "Status",
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

  // handle status change
  const queryClient = useQueryClient();

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: string }) =>
      patchStatus(token!, reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const handleStatusChange = (reportId: string, status: string) => {
    changeStatus({ reportId, status });
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>
      <TableLayout
        headers={headers}
        data={reports ?? []}
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
            <TableCell className="max-w-50 whitespace-normal wrap-break-words line-clamp-3">
              {report.description}
            </TableCell>

            <TableCell className="capitalize">
              {report.violation.replace(/_/g, " ")}
            </TableCell>
            <TableCell className="max-w-50 truncate">
              {report.location?.name ?? "Unknown"}
            </TableCell>
            <TableCell>
              {new Date(report.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Select
                defaultValue={report.status}
                onValueChange={(value) => handleStatusChange(report._id, value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(s.value)}`}
                      >
                        {s.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        )}
      />
    </div>
  );
};

export default Reports;
