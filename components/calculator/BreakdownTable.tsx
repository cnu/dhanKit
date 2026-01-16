"use client";

import { useState } from "react";
import { formatIndianCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface BreakdownRow {
  year?: number;
  month?: number;
  invested: number;
  interest: number;
  totalValue: number;
  monthlySIP?: number;
  inflationAdjustedValue?: number;
}

interface BreakdownTableProps {
  data: BreakdownRow[];
  initialRows?: number;
  periodLabel?: "Year" | "Month";
}

export function BreakdownTable({ data, initialRows = 5, periodLabel = "Year" }: BreakdownTableProps) {
  const [showAll, setShowAll] = useState(false);
  const displayData = showAll ? data : data.slice(0, initialRows);
  const hasMore = data.length > initialRows;
  const hasMonthlySIP = data.some((row) => row.monthlySIP !== undefined);
  const hasInflationAdjusted = data.some((row) => row.inflationAdjustedValue !== undefined);
  const periodKey = periodLabel === "Month" ? "month" : "year";

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">{periodLabel}</th>
              {hasMonthlySIP && (
                <th className="px-4 py-3 text-right font-medium">Monthly SIP</th>
              )}
              <th className="px-4 py-3 text-right font-medium">Invested</th>
              <th className="px-4 py-3 text-right font-medium">Interest</th>
              <th className="px-4 py-3 text-right font-medium">Total Value</th>
              {hasInflationAdjusted && (
                <th className="px-4 py-3 text-right font-medium">Adjusted Value</th>
              )}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, index) => (
              <tr key={row[periodKey] ?? index} className="border-t border-border">
                <td className="px-4 py-3">{row[periodKey]}</td>
                {hasMonthlySIP && (
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                    {formatIndianCurrency(row.monthlySIP ?? 0)}
                  </td>
                )}
                <td className="px-4 py-3 text-right font-mono">
                  {formatIndianCurrency(row.invested)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-primary">
                  {formatIndianCurrency(row.interest)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-medium">
                  {formatIndianCurrency(row.totalValue)}
                </td>
                {hasInflationAdjusted && (
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                    {formatIndianCurrency(row.inflationAdjustedValue ?? 0)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : `Show All ${data.length} Rows`}
        </Button>
      )}
    </div>
  );
}
