import { Card, CardContent } from "@/components/ui/card";
import { formatIndianCurrency } from "@/lib/format";

interface ResultItem {
  label: string;
  value: number | string;
  highlight?: boolean;
  /** If true, format as percentage instead of currency */
  isPercentage?: boolean;
  /** If true, display value as plain text without formatting */
  isText?: boolean;
}

interface ResultCardProps {
  title: string;
  mainValue: number;
  items: ResultItem[];
  secondaryValue?: {
    label: string;
    value: number | string;
    isText?: boolean;
  };
  tertiaryValue?: {
    label: string;
    value: string;
    variant?: "default" | "destructive";
  };
  /** If true, format mainValue as percentage (e.g., "+14.87%") instead of currency */
  mainValueIsPercentage?: boolean;
  /** Custom variant for mainValue color. Defaults to "default" (primary color) */
  mainValueVariant?: "default" | "destructive";
}

export function ResultCard({ title, mainValue, items, secondaryValue, tertiaryValue, mainValueIsPercentage, mainValueVariant = "default" }: ResultCardProps) {
  const mainValueColor = mainValueVariant === "destructive" ? "text-destructive" : "text-primary";

  const formatMainValue = () => {
    if (mainValueIsPercentage) {
      const sign = mainValue >= 0 ? "+" : "";
      return `${sign}${mainValue}%`;
    }
    return formatIndianCurrency(mainValue);
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className={`text-3xl font-bold font-mono ${mainValueColor}`}>
          {formatMainValue()}
        </p>
        {secondaryValue && (
          <p className="text-sm text-muted-foreground mt-1">
            <span>{secondaryValue.label}: </span>
            <span className="font-mono">
              {secondaryValue.isText
                ? secondaryValue.value
                : formatIndianCurrency(secondaryValue.value as number)}
            </span>
          </p>
        )}
        {tertiaryValue && (
          <p className={`text-sm mt-1 ${tertiaryValue.variant === "destructive" ? "text-destructive" : "text-muted-foreground"}`}>
            <span>{tertiaryValue.label}: </span>
            <span className={`font-mono font-medium ${tertiaryValue.variant === "destructive" ? "text-destructive" : "text-primary"}`}>
              {tertiaryValue.value}
            </span>
          </p>
        )}
        {(secondaryValue || tertiaryValue) && <div className="mb-4" />}
        {!secondaryValue && !tertiaryValue && <div className="mb-6" />}

        <div className="space-y-3 border-t border-border pt-4">
          {items.map((item) => {
            const formattedValue = item.isText
              ? String(item.value)
              : item.isPercentage
                ? `${(item.value as number) >= 0 ? "+" : ""}${item.value}%`
                : formatIndianCurrency(item.value as number);

            return (
              <div key={item.label} className="flex justify-between">
                <span className="text-muted-foreground">{item.label}</span>
                <span
                  className={`font-mono ${
                    item.highlight ? "text-primary font-medium" : ""
                  }`}
                >
                  {formattedValue}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
