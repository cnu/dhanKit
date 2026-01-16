"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { formatIndianNumber } from "@/lib/format";

interface InputSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  formatValue?: boolean;
}

export function InputSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix = "",
  suffix = "",
  formatValue = true,
}: InputSliderProps) {
  const displayValue = formatValue ? formatIndianNumber(value) : value.toString();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");
    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-1">
          {prefix && <span className="text-muted-foreground">{prefix}</span>}
          <Input
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            className="w-28 text-right font-mono"
          />
          {suffix && <span className="text-muted-foreground">{suffix}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {prefix}
          {formatValue ? formatIndianNumber(min) : min}
          {suffix}
        </span>
        <span>
          {prefix}
          {formatValue ? formatIndianNumber(max) : max}
          {suffix}
        </span>
      </div>
    </div>
  );
}
