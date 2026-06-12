import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Violation } from "@/types/types";

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

const violations = [
  { label: "Speeding", value: Violation.Speeding },
  { label: "Running Red Light", value: Violation.RunningRedLight },
  { label: "Drunk Driving", value: Violation.DrunkDriving },
  { label: "Reckless Driving", value: Violation.RecklessDriving },
];

interface ReportFilterProps {
  setSelectedStatus: React.Dispatch<React.SetStateAction<string>>;
  setSelectedViolation: React.Dispatch<React.SetStateAction<string>>;
}

const ReportFilter = ({
  setSelectedStatus,
  setSelectedViolation,
}: ReportFilterProps) => {
  return (
    <div>
      <section className="flex gap-2">
        {/* status */}
        <Select onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem
                key={status.value}
                value={status.value}
                className={`${statusColor(status.value)}`}
              >
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setSelectedViolation}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Filter by violation" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Violations</SelectItem>
            {violations.map((v) => (
              <SelectItem key={v.value} value={v.value}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>
    </div>
  );
};

export default ReportFilter;
