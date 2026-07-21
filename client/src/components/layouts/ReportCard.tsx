import React, { useMemo } from "react";
import type { Report } from "@/types/types";

export type ReportStatus = "pending" | "approved" | "rejected";

interface ReportCardProps {
  reports: Report[];
}

export default function ReportCard({ reports }: ReportCardProps) {
  // Memoizing the calculation so it only recalculates when `reports` actually changes
  const stats = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    for (const report of reports) {
      if (report.status === "pending") pending++;
      else if (report.status === "approved") approved++;
      else if (report.status === "rejected") rejected++;
    }

    return {
      total: reports.length,
      pending,
      approved,
      rejected,
    };
  }, [reports]);

  const cards = [
    {
      label: "Total",
      value: stats.total,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Pending",
      value: stats.pending,
      bgColor: "bg-amber-50",
      textColor: "text-amber-800",
    },
    {
      label: "Approved",
      value: stats.approved,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-800",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
  ];

  return (
    <div className="rounded-xl bg-transparent mb-6 border p-4">
      <h2 className="text-lg font-semibold text-slate-900 ">Report Stats</h2>
      <h3 className="text-sm mb-3">All reports status</h3>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`flex flex-col items-center justify-center p-4 rounded-xl ${card.bgColor}`}
          >
            <span className={`text-3xl font-bold ${card.textColor}`}>
              {card.value}
            </span>
            <span className={`text-xs font-semibold mt-1 ${card.textColor}`}>
              {card.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
