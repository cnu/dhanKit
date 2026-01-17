"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { formatIndianCurrency } from "@/lib/format";

interface ComparisonDataPoint {
  year: number;
  age: number;
  startNow: number;
  startLater: number;
}

interface ComparisonChartProps {
  data: ComparisonDataPoint[];
  currentAge: number;
  delayYears: number;
}

const COLORS = {
  startNow: "#10B981", // Primary emerald/green
  startLater: "#94A3B8", // Slate/gray for delayed scenario
  gap: "#EF4444", // Red for the cost/gap
};

export function ComparisonChart({
  data,
  currentAge,
  delayYears,
}: ComparisonChartProps) {
  const delayEndAge = currentAge + delayYears;

  // Format large numbers in lakhs/crores for Y-axis
  const formatYAxis = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    }
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(0)}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="startNowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.startNow} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.startNow} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="startLaterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.startLater} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.startLater} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="age"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
            label={{
              value: "Age",
              position: "insideBottomRight",
              offset: -5,
              fontSize: 12,
            }}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
            width={60}
          />
          <Tooltip
            formatter={(value, name) => [
              <span key={String(name)} className="font-mono">
                {formatIndianCurrency(Number(value))}
              </span>,
              name === "startNow" ? "Start Now" : "Start Later",
            ]}
            labelFormatter={(age) => `Age ${age}`}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
            }}
          />
          <Legend
            formatter={(value) => (
              <span className="text-sm">
                {value === "startNow" ? "Start Now" : `Wait ${delayYears} Years`}
              </span>
            )}
          />
          <ReferenceLine
            x={delayEndAge}
            stroke={COLORS.gap}
            strokeDasharray="5 5"
            strokeWidth={1}
            label={{
              value: "Delay ends",
              position: "top",
              fontSize: 10,
              fill: COLORS.gap,
            }}
          />
          <Area
            type="monotone"
            dataKey="startNow"
            stroke={COLORS.startNow}
            strokeWidth={2}
            fill="url(#startNowGradient)"
            name="startNow"
          />
          <Area
            type="monotone"
            dataKey="startLater"
            stroke={COLORS.startLater}
            strokeWidth={2}
            fill="url(#startLaterGradient)"
            name="startLater"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
