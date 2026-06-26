import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Violation } from "@/types/types";
import { useAppSelector } from "@/redux/hooks";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

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
  setSelectedRadius: React.Dispatch<React.SetStateAction<number | "all">>;
  selectedRadius: number | "all";
}

const ReportFilter = ({
  setSelectedStatus,
  setSelectedViolation,
  setSelectedRadius,
  selectedRadius,
}: ReportFilterProps) => {
  const { locationName, longitude, latitude } = useAppSelector(
    (state) => state.location,
  );

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

      {locationName && (
        <div className="flex items-center gap-4 mt-6">
          <FieldSet className="w-full max-w-xs">
            <FieldLegend variant="label">Your Location:</FieldLegend>
            <FieldDescription>
              {locationName.split("-")[0].trim()}
            </FieldDescription>
            <RadioGroup
              value={selectedRadius.toString()}
              onValueChange={(val) => {
                setSelectedRadius(val === "all" ? "all" : parseInt(val));
                console.log("Selected radius:", val);
              }}
            >
              <Field orientation="horizontal">
                <RadioGroupItem value="20" id="20" />
                <FieldLabel htmlFor="20" className="font-normal">
                  Radius 20KM
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <RadioGroupItem value="40" id="40" />
                <FieldLabel htmlFor="40" className="font-normal">
                  Radius 40KM
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <RadioGroupItem value="60" id="60" />
                <FieldLabel htmlFor="60" className="font-normal">
                  Radius 60KM
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <RadioGroupItem value="all" id="all" />
                <FieldLabel htmlFor="all" className="font-normal">
                  All
                </FieldLabel>
              </Field>
            </RadioGroup>
          </FieldSet>
        </div>
      )}
    </div>
  );
};

export default ReportFilter;
