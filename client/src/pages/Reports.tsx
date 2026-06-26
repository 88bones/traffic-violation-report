import { useState } from "react";
import TableLayout from "@/components/layouts/TableLayout";
import { useAppSelector } from "@/redux/hooks";
import { getReports, patchStatus } from "@/services/reportService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import ReportFilter from "@/components/layouts/ReportFilter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  "Violation",
  "Location",
  "Date",
  "Status",
];

const Reports = () => {
  const { token } = useAppSelector((state) => state.auth);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedViolation, setSelectedViolation] = useState("");
  // State for the modal
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [selectedRadius, setSelectedRadius] = useState<number | "all">("all");

  const { locationName, longitude, latitude } = useAppSelector(
    (state) => state.location,
  );
  // console.log({ locationName, longitude, latitude });

  const queryClient = useQueryClient();

  const {
    data: reports,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reports"],
    queryFn: () => getReports(token!),
    enabled: !!token,
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: string }) =>
      patchStatus(token!, reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  // Haversine distance function
  const haversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  //all filter
  const filteredReports = (reports ?? []).filter((report) => {
    const statusMatch =
      !selectedStatus ||
      selectedStatus === "all" ||
      report.status === selectedStatus;
    const violationMatch =
      !selectedViolation ||
      selectedViolation === "all" ||
      report.violation === selectedViolation;

    const distanceMatch =
      selectedRadius === "all" ||
      !latitude ||
      !longitude ||
      haversineDistance(
        latitude,
        longitude,
        report.location.latitude,
        report.location.longitude,
      ) <= selectedRadius;

    return statusMatch && violationMatch && distanceMatch;
  });

  if (isLoading) return <p className="p-10 text-center">Loading...</p>;
  if (error) return <p className="text-red-500">{(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="text-muted-foreground">
        Manage and review traffic violation reports.
      </p>

      <ReportFilter
        setSelectedStatus={setSelectedStatus}
        setSelectedViolation={setSelectedViolation}
        setSelectedRadius={setSelectedRadius}
        selectedRadius={selectedRadius}
      />

      <TableLayout
        headers={headers}
        data={filteredReports}
        renderRow={(report: Report, index: number) => (
          <TableRow
            key={report._id}
            className="cursor-pointer hover:bg-slate-50"
            onClick={() => setViewingReport(report)}
          >
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <img
                src={`${API_BASE_URL}/${report.image}`}
                alt="Report"
                className="h-12 w-12 object-cover rounded"
              />
            </TableCell>
            <TableCell className="font-medium uppercase">
              {report.number_plate}
            </TableCell>
            <TableCell className="capitalize">
              {report.violation.replace(/_/g, " ")}
            </TableCell>
            <TableCell className="max-w-[150px] truncate">
              {report.location?.name ?? "Unknown"}
            </TableCell>
            <TableCell>
              {new Date(report.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              {/* stopPropagation prevents row click (modal) from opening when changing status */}
              <Select
                defaultValue={report.status}
                onValueChange={(value) =>
                  changeStatus({ reportId: report._id, status: value })
                }
              >
                <SelectTrigger className={`${statusColor(report.status)} w-32`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        )}
      />

      {/* Single Dialog Instance */}
      <Dialog
        open={!!viewingReport}
        onOpenChange={() => setViewingReport(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Violation reported on{" "}
              {viewingReport &&
                new Date(viewingReport.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {viewingReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <img
                  src={`${API_BASE_URL}/${viewingReport.image}`}
                  alt="Evidence"
                  className="w-full rounded-lg border object-cover"
                />
                <p className="text-sm font-semibold">
                  Plate:{" "}
                  <span className="uppercase">
                    {viewingReport.number_plate}
                  </span>
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase">
                    Violation
                  </h4>
                  <p className="capitalize">
                    {viewingReport.violation.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase">
                    Description
                  </h4>
                  <p className="text-sm">
                    {viewingReport.description || "No description provided."}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase">
                    Location
                  </h4>
                  <p className="text-sm">
                    {viewingReport.location?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase">
                    Current Status
                  </h4>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${statusColor(viewingReport.status)}`}
                  >
                    {viewingReport.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
