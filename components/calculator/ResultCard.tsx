import { Card, CardContent } from "@/components/ui/card";
import { formatIndianCurrency } from "@/lib/format";

interface ResultItem {
  label: string;
  value: number;
  highlight?: boolean;
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
}

export function ResultCard({ title, mainValue, items, secondaryValue, tertiaryValue }: ResultCardProps) {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold font-mono text-primary">
          {formatIndianCurrency(mainValue)}
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
          {items.map((item) => (
            <div key={item.label} className="flex justify-between">
              <span className="text-muted-foreground">{item.label}</span>
              <span
                className={`font-mono ${
                  item.highlight ? "text-primary font-medium" : ""
                }`}
              >
                {formatIndianCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
