"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type DateRange = { from: string; to: string };

/** Local calendar day as YYYY-MM-DD. */
export const toDay = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const monthRange = (offset: number): DateRange => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const last = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { from: toDay(first), to: toDay(last) };
};

export const presets: { key: string; label: string; range: () => DateRange }[] = [
  { key: "this-month", label: "This month", range: () => monthRange(0) },
  { key: "last-month", label: "Last month", range: () => monthRange(-1) },
  {
    key: "last-6-months",
    label: "Last 6 months",
    range: () => ({ from: monthRange(-5).from, to: monthRange(0).to }),
  },
  {
    key: "this-year",
    label: "This year",
    range: () => {
      const year = new Date().getFullYear();
      return { from: `${year}-01-01`, to: `${year}-12-31` };
    },
  },
  { key: "all", label: "All time", range: () => ({ from: "", to: "" }) },
];

export const rangeToParams = (range: DateRange) => {
  const params = new URLSearchParams();
  if (range.from) params.set("from", range.from);
  if (range.to) params.set("to", range.to);
  return params.toString();
};

type Props = {
  range: DateRange;
  onChange: (range: DateRange) => void;
};

const DateRangeFilter = ({ range, onChange }: Props) => {
  const activePreset = presets.find((preset) => {
    const value = preset.range();
    return value.from === range.from && value.to === range.to;
  })?.key;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.key}
            type="button"
            size="sm"
            variant={activePreset === preset.key ? "default" : "outline"}
            onClick={() => onChange(preset.range())}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          aria-label="From date"
          value={range.from}
          max={range.to || undefined}
          onChange={(e) => onChange({ ...range, from: e.target.value })}
          className={cn("h-9 w-auto bg-white")}
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          aria-label="To date"
          value={range.to}
          min={range.from || undefined}
          onChange={(e) => onChange({ ...range, to: e.target.value })}
          className={cn("h-9 w-auto bg-white")}
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;
