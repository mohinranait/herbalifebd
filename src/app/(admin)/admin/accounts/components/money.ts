import { CURRENCY } from "@/lib/envSecret";

const numberFormatter = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 2 });

export const money = (value: number | undefined | null) => {
  const amount = value || 0;
  return `${amount < 0 ? "-" : ""}${CURRENCY}${numberFormatter.format(Math.abs(amount))}`;
};

/** Green for profit, red for loss, neutral for zero. */
export const profitClass = (value: number | undefined | null) => {
  const amount = value || 0;
  if (amount > 0) return "text-emerald-600";
  if (amount < 0) return "text-red-600";
  return "text-foreground";
};

export const monthLabel = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
};
