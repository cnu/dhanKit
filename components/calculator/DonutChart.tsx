"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatIndianCurrency } from "@/lib/format";

interface DonutChartProps {
  invested: number;
  returns: number;
  investedLabel?: string;
  returnsLabel?: string;
}

// Using actual hex colors since Recharts can't parse CSS variables
const COLORS = {
  invested: "#10B981", // Primary emerald
  returns: "#6366F1",  // Secondary indigo
};

export function DonutChart({
  invested,
  returns,
  investedLabel = "Invested",
  returnsLabel = "Returns",
}: DonutChartProps) {
  const data = [
    { name: investedLabel, value: invested, color: COLORS.invested },
    { name: returnsLabel, value: returns, color: COLORS.returns },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => (
              <span className="font-mono">{formatIndianCurrency(Number(value))}</span>
            )}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
            }}
          />
          <Legend
            formatter={(value) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
