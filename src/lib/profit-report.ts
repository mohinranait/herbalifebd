import { db } from "@/prisma/db";

/**
 * Profit & loss report.
 *
 * - Only DELIVERED, non-deleted orders count as sales.
 * - An order belongs to the day it was delivered (falls back to the order date).
 * - Revenue  = item sale price × quantity, minus the order's discount
 *              (shared between its items in proportion to their value).
 * - Cost     = buying cost × quantity. The cost saved on the order item is used;
 *              older orders without one fall back to the product's current cost.
 * - Gross    = revenue − cost.
 * - Net      = gross − expenses of the same period.
 * - Shipping charge is treated as pass-through (collected from the customer, paid
 *   to the courier). Record any extra courier cost as an expense.
 */

const REPORT_TIMEZONE = "Asia/Dhaka";

const monthFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: REPORT_TIMEZONE,
  year: "numeric",
  month: "2-digit",
});

/** "2026-11" in the shop's timezone. */
export function monthKey(date: Date): string {
  const parts = monthFormatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  return `${year}-${month}`;
}

const round = (value: number) => Math.round(value * 100) / 100;

export type CostSource = "recorded" | "estimated" | "missing";

export interface ProfitTotals {
  revenue: number;
  cost: number;
  grossProfit: number;
  quantity: number;
}

export interface ProductProfitRow extends ProfitTotals {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  margin: number;
  /** true when at least one sold unit had no cost recorded anywhere */
  hasMissingCost: boolean;
}

export interface MonthlyProfitRow extends ProfitTotals {
  month: string;
  orders: number;
  expenses: number;
  netProfit: number;
}

export interface ProfitReport {
  range: { from: string | null; to: string | null };
  summary: ProfitTotals & {
    orders: number;
    expenses: number;
    netProfit: number;
    margin: number;
  };
  costQuality: {
    /** units whose cost was saved on the order */
    recordedUnits: number;
    /** units costed from the product's current cost price */
    estimatedUnits: number;
    /** units with no cost at all — counted as 0 cost, so profit is overstated */
    missingUnits: number;
  };
  monthly: MonthlyProfitRow[];
  products: ProductProfitRow[];
  expensesByCategory: { category: string; amount: number }[];
}

const emptyTotals = (): ProfitTotals => ({ revenue: 0, cost: 0, grossProfit: 0, quantity: 0 });

function inRange(date: Date, from: Date | null, to: Date | null) {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export async function buildProfitReport(from: Date | null, to: Date | null): Promise<ProfitReport> {
  const [orders, products, variations, expenses] = await Promise.all([
    db.orm.orders.where({ orderStatus: "DELIVERED" }).include("items").all(),
    db.orm.products.select("id", "costPrice").all(),
    db.orm.product_variations.select("id", "costPrice").all(),
    db.orm.expenses.all(),
  ]);

  const productCost = new Map<string, number>();
  for (const p of products as any[]) {
    if (p.costPrice !== null && p.costPrice !== undefined) productCost.set(String(p.id), p.costPrice);
  }
  const variationCost = new Map<string, number>();
  for (const v of variations as any[]) {
    if (v.costPrice !== null && v.costPrice !== undefined) variationCost.set(String(v.id), v.costPrice);
  }

  const resolveCost = (item: any): { cost: number; source: CostSource } => {
    if (item.costPrice !== null && item.costPrice !== undefined) {
      return { cost: item.costPrice, source: "recorded" };
    }
    const fallback =
      (item.variationId ? variationCost.get(String(item.variationId)) : undefined) ??
      productCost.get(String(item.productId));
    if (fallback !== undefined) return { cost: fallback, source: "estimated" };
    return { cost: 0, source: "missing" };
  };

  const summary = { ...emptyTotals(), orders: 0, expenses: 0, netProfit: 0, margin: 0 };
  const costQuality = { recordedUnits: 0, estimatedUnits: 0, missingUnits: 0 };
  const monthly = new Map<string, MonthlyProfitRow>();
  const byProduct = new Map<string, ProductProfitRow>();

  const monthRow = (key: string) => {
    let row = monthly.get(key);
    if (!row) {
      row = { month: key, ...emptyTotals(), orders: 0, expenses: 0, netProfit: 0 };
      monthly.set(key, row);
    }
    return row;
  };

  for (const order of orders as any[]) {
    if (order.isDeleted) continue;

    const soldAt = new Date(order.deliveredAt || order.createdAt);
    if (!inRange(soldAt, from, to)) continue;

    const items: any[] = Array.isArray(order.items) ? order.items : [];
    const itemsValue = items.reduce((sum, item) => sum + (item.salePrice || 0) * (item.quantity || 0), 0);
    const orderDiscount = Math.max(order.discount || 0, order.couponDiscount || 0);

    const month = monthRow(monthKey(soldAt));
    month.orders += 1;
    summary.orders += 1;

    for (const item of items) {
      const quantity = item.quantity || 0;
      const gross = (item.salePrice || 0) * quantity;
      const discountShare = itemsValue > 0 ? (orderDiscount * gross) / itemsValue : 0;
      const revenue = gross - discountShare;

      const { cost: unitCost, source } = resolveCost(item);
      const cost = unitCost * quantity;

      if (source === "recorded") costQuality.recordedUnits += quantity;
      else if (source === "estimated") costQuality.estimatedUnits += quantity;
      else costQuality.missingUnits += quantity;

      for (const bucket of [summary, month]) {
        bucket.revenue += revenue;
        bucket.cost += cost;
        bucket.quantity += quantity;
      }

      const productId = String(item.productId);
      let row = byProduct.get(productId);
      if (!row) {
        row = {
          productId,
          productName: item.productName,
          productSlug: item.productSlug,
          productImage: item.productImage || null,
          ...emptyTotals(),
          margin: 0,
          hasMissingCost: false,
        };
        byProduct.set(productId, row);
      }
      row.revenue += revenue;
      row.cost += cost;
      row.quantity += quantity;
      if (source === "missing") row.hasMissingCost = true;
    }
  }

  const expenseCategories = new Map<string, number>();
  for (const expense of expenses as any[]) {
    const spentAt = new Date(expense.date);
    if (!inRange(spentAt, from, to)) continue;
    const amount = expense.amount || 0;
    summary.expenses += amount;
    monthRow(monthKey(spentAt)).expenses += amount;
    const category = expense.category || "Other";
    expenseCategories.set(category, (expenseCategories.get(category) || 0) + amount);
  }

  const finish = <T extends ProfitTotals>(row: T): T => {
    row.revenue = round(row.revenue);
    row.cost = round(row.cost);
    row.grossProfit = round(row.revenue - row.cost);
    return row;
  };

  finish(summary);
  summary.expenses = round(summary.expenses);
  summary.netProfit = round(summary.grossProfit - summary.expenses);
  summary.margin = summary.revenue > 0 ? round((summary.netProfit / summary.revenue) * 100) : 0;

  const monthlyRows = [...monthly.values()]
    .map((row) => {
      finish(row);
      row.expenses = round(row.expenses);
      row.netProfit = round(row.grossProfit - row.expenses);
      return row;
    })
    .sort((a, b) => b.month.localeCompare(a.month));

  const productRows = [...byProduct.values()]
    .map((row) => {
      finish(row);
      row.margin = row.revenue > 0 ? round((row.grossProfit / row.revenue) * 100) : 0;
      return row;
    })
    .sort((a, b) => b.grossProfit - a.grossProfit);

  return {
    range: { from: from?.toISOString() ?? null, to: to?.toISOString() ?? null },
    summary,
    costQuality,
    monthly: monthlyRows,
    products: productRows,
    expensesByCategory: [...expenseCategories.entries()]
      .map(([category, amount]) => ({ category, amount: round(amount) }))
      .sort((a, b) => b.amount - a.amount),
  };
}

/** Parses `YYYY-MM-DD` as a day in the shop's timezone (UTC+6). */
export function parseReportDate(value: string | null, endOfDay = false): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = match
    ? new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+06:00`)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
