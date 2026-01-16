"use client";

import { useState, useEffect } from "react";
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
  const [inputValue, setInputValue] = useState(
    formatValue ? formatIndianNumber(value) : value.toString()
  );
  const [isFocused, setIsFocused] = useState(false);

  // Sync input display when value changes externally (e.g., from slider)
  useEffect(() => {
    if (!isFocused) {
      setInputValue(formatValue ? formatIndianNumber(value) : value.toString());
    }
  }, [value, formatValue, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);

    // Try to parse and update if valid
    const numValue = parseFloat(raw.replace(/,/g, ""));
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numValue = parseFloat(inputValue.replace(/,/g, ""));

    if (isNaN(numValue)) {
      // Reset to current value if invalid
      setInputValue(formatValue ? formatIndianNumber(value) : value.toString());
    } else {
      // Clamp to valid range
      const clampedValue = Math.min(max, Math.max(min, numValue));
      onChange(clampedValue);
      setInputValue(formatValue ? formatIndianNumber(clampedValue) : clampedValue.toString());
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Show raw number without formatting when focused for easier editing
    setInputValue(value.toString());
    // Select all text on focus
    e.target.select();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-1">
          {prefix && <span className="text-muted-foreground">{prefix}</span>}
          <Input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
