import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useMemo } from "react";

const chartConfig = {
  violations: {
    label: "Violations",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface Props {
  reports: Report[];
}

export function ReportLineChart({ reports }: Props) {
  const chartData = useMemo(() => {
    // ← count violations per hour
    const hours = Array(24).fill(0);
    reports.forEach((r) => {
      const hour = new Date(r.createdAt).getHours();
      hours[hour]++;
    });

    return hours.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      violations: count,
    }));
  }, [reports]);

  const peakHour = chartData.reduce((max, curr) =>
    curr.violations > max.violations ? curr : max,
  );

  const totalViolations = reports.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peak Violation Hours</CardTitle>
        <CardDescription>Violations by hour of day — all time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value} // ← show hour
              interval={2} // ← show every 2 hours
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="violations"
              type="linear"
              fill="var(--color-violations)"
              fillOpacity={0.4}
              stroke="var(--color-violations)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Peak time: {peakHour.hour} with {peakHour.violations} violations
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Based on {totalViolations} total reports
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
