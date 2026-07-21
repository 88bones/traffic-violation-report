import React, { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Report } from "@/types/types";

interface ReportDonutProps {
  reports: Report[];
}

const chartConfig = {
  value: {
    label: "Reports",
  },
  speeding: {
    label: "Speeding",
    color: "#177AD5",
  },
  running_red_light: {
    label: "Red Light",
    color: "#79D2DE",
  },
  drunk_driving: {
    label: "Drunk Driving",
    color: "#ED6665",
  },
  reckless_driving: {
    label: "Reckless",
    color: "#FCD667",
  },
} satisfies ChartConfig;

export default function ReportDonut({ reports }: ReportDonutProps) {
  const { chartData, total } = useMemo(() => {
    const counts = {
      speeding: 0,
      running_red_light: 0,
      drunk_driving: 0,
      reckless_driving: 0,
    };

    reports.forEach((r) => {
      if (r.violation in counts) {
        counts[r.violation as keyof typeof counts]++;
      }
    });

    const totalCount = reports.length;
    const divisor = totalCount === 0 ? 1 : totalCount;

    const data = [
      {
        violation: "Speeding",
        value: counts.speeding,
        percentage: `${Math.round((counts.speeding / divisor) * 100)}%`,
        fill: chartConfig.speeding.color,
      },
      {
        violation: "Running Red Light",
        value: counts.running_red_light,
        percentage: `${Math.round((counts.running_red_light / divisor) * 100)}%`,
        fill: chartConfig.running_red_light.color,
      },
      {
        violation: "Drunk Driving",
        value: counts.drunk_driving,
        percentage: `${Math.round((counts.drunk_driving / divisor) * 100)}%`,
        fill: chartConfig.drunk_driving.color,
      },
      {
        violation: "Reckless Driving",
        value: counts.reckless_driving,
        percentage: `${Math.round((counts.reckless_driving / divisor) * 100)}%`,
        fill: chartConfig.reckless_driving.color,
      },
    ].filter((item) => item.value > 0);

    return { chartData: data, total: totalCount };
  }, [reports]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Violation Breakdown</CardTitle>
        <CardDescription>Traffic Reports Overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[260px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="violation"
              innerRadius={70}
              outerRadius={95}
              strokeWidth={2}
            >
              {/* Option A: Native Recharts Center Label (Shows Total inside Donut Hole) */}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-xs"
                        >
                          Total Reports
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Clean Modern Legend Below Chart */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {chartData.map((data) => (
            <div key={data.violation} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: data.fill }}
              />
              <span className="text-muted-foreground truncate">
                {data.violation}
              </span>
              <span className="ml-auto font-medium">{data.percentage}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
