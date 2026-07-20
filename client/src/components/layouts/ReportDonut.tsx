import { Pie, PieChart, Cell } from "recharts";

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
  const total = reports.length;
  const speeding = reports.filter((r) => r.violation === "speeding").length;
  const runningRedLight = reports.filter(
    (r) => r.violation === "running_red_light",
  ).length;
  const drunkDriving = reports.filter(
    (r) => r.violation === "drunk_driving",
  ).length;
  const recklessDriving = reports.filter(
    (r) => r.violation === "reckless_driving",
  ).length;

  const divisor = total === 0 ? 1 : total;

  const speedingPct = Math.round((speeding / divisor) * 100);
  const redLightPct = Math.round((runningRedLight / divisor) * 100);
  const drunkPct = Math.round((drunkDriving / divisor) * 100);
  const recklessPct = Math.round((recklessDriving / divisor) * 100);

  const chartData = [
    {
      violation: "speeding",
      value: speeding,
      percentage: `${speedingPct}%`,
      fill: chartConfig.speeding.color,
    },
    {
      violation: "running_red_light",
      value: runningRedLight,
      percentage: `${redLightPct}%`,
      fill: chartConfig.running_red_light.color,
    },
    {
      violation: "drunk_driving",
      value: drunkDriving,
      percentage: `${drunkPct}%`,
      fill: chartConfig.drunk_driving.color,
    },
    {
      violation: "reckless_driving",
      value: recklessDriving,
      percentage: `${recklessPct}%`,
      fill: chartConfig.reckless_driving.color,
    },
  ].filter((item) => item.value > 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Violation Breakdown</CardTitle>
        <CardDescription>Traffic Reports Overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
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
              innerRadius={60}
              strokeWidth={2}
            />
          </PieChart>
        </ChartContainer>
        <div>Legend</div>
        <div>
          {chartData.map((data, index) => (
            <div key={index}>
              <div
                style={{
                  backgroundColor: data.fill,
                  width: 20,
                  height: 20,
                  display: "inline-block",
                }}
              ></div>
              <span>
                {data.violation} - {data.percentage}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
