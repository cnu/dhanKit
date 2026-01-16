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
    value: number;
  };
}

export function ResultCard({ title, mainValue, items, secondaryValue }: ResultCardProps) {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold font-mono text-primary">
          {formatIndianCurrency(mainValue)}
        </p>
        {secondaryValue && (
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            <span>{secondaryValue.label}: </span>
            <span className="font-mono">{formatIndianCurrency(secondaryValue.value)}</span>
          </p>
        )}
        {!secondaryValue && <div className="mb-6" />}

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
