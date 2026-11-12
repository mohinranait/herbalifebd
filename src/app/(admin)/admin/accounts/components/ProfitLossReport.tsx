"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Banknote, Package, Receipt, ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useGetProfitReportQuery } from "@/redux/service/accounts";

import DateRangeFilter, { DateRange, presets, rangeToParams } from "./date-range";
import { money, monthLabel, profitClass } from "./money";

const ProfitLossReport = () => {
  const [range, setRange] = useState<DateRange>(() => presets[0].range());
  const { data, isLoading, isFetching, isError } = useGetProfitReportQuery(rangeToParams(range));

  const report = data?.data;
  const summary = report?.summary;
  const quality = report?.costQuality;
  const isProfit = (summary?.netProfit || 0) >= 0;

  const stats = [
    { title: "Sales", value: money(summary?.revenue), hint: `${summary?.orders || 0} delivered orders`, icon: ShoppingCart },
    { title: "Product cost", value: money(summary?.cost), hint: `${summary?.quantity || 0} units sold`, icon: Package },
    { title: "Gross profit", value: money(summary?.grossProfit), hint: "Sales − product cost", icon: Banknote, tone: profitClass(summary?.grossProfit) },
    { title: "Expenses", value: money(summary?.expenses), hint: "Courier, ads, salary…", icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profit &amp; Loss</h1>
        <p className="text-sm text-muted-foreground">
          What you earned after product cost and expenses. Only delivered orders are counted.
        </p>
      </div>

      <DateRangeFilter range={range} onChange={setRange} />

      {isError ? (
        <Card className="py-10 text-center text-sm text-red-600">Could not load the report. Please try again.</Card>
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className={cn("space-y-6 transition-opacity", isFetching && "opacity-60")}>
          {/* Net result */}
          <Card className={cn("py-6", isProfit ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50")}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full text-white",
                    isProfit ? "bg-emerald-600" : "bg-red-600"
                  )}
                >
                  {isProfit ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                </span>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isProfit ? "Net profit" : "Net loss"}
                  </p>
                  <p className={cn("text-3xl font-bold", profitClass(summary?.netProfit))}>
                    {money(Math.abs(summary?.netProfit || 0))}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Gross profit {money(summary?.grossProfit)} − expenses {money(summary?.expenses)}
                <br />
                Net margin {summary?.margin || 0}% of sales
              </p>
            </CardContent>
          </Card>

          {/* Stat tiles */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="py-5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={cn("text-2xl font-bold", stat.tone)}>{stat.value}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Cost data warning */}
          {quality && (quality.missingUnits > 0 || quality.estimatedUnits > 0) && (
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                {quality.missingUnits > 0 && (
                  <p>
                    <strong>{quality.missingUnits} sold unit(s) have no cost price</strong>, so their cost is counted
                    as {money(0)} and the profit shown is higher than the real one. Set the cost price on those
                    products (marked below).
                  </p>
                )}
                {quality.estimatedUnits > 0 && (
                  <p>
                    {quality.estimatedUnits} unit(s) come from older orders that did not save a cost; the
                    product&apos;s current cost price is used for them.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Monthly */}
          <Card className="py-5">
            <CardHeader>
              <CardTitle>Month by month</CardTitle>
            </CardHeader>
            <CardContent>
              {report?.monthly.length ? (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Sales</TableHead>
                        <TableHead className="text-right">Product cost</TableHead>
                        <TableHead className="text-right">Gross profit</TableHead>
                        <TableHead className="text-right">Expenses</TableHead>
                        <TableHead className="text-right">Net profit / loss</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.monthly.map((row) => (
                        <TableRow key={row.month}>
                          <TableCell className="font-medium">{monthLabel(row.month)}</TableCell>
                          <TableCell className="text-right">{row.orders}</TableCell>
                          <TableCell className="text-right">{money(row.revenue)}</TableCell>
                          <TableCell className="text-right">{money(row.cost)}</TableCell>
                          <TableCell className={cn("text-right", profitClass(row.grossProfit))}>
                            {money(row.grossProfit)}
                          </TableCell>
                          <TableCell className="text-right">{money(row.expenses)}</TableCell>
                          <TableCell className={cn("text-right font-semibold", profitClass(row.netProfit))}>
                            {money(row.netProfit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No delivered orders or expenses in this period.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Per product */}
          <Card className="py-5">
            <CardHeader>
              <CardTitle>Product by product</CardTitle>
            </CardHeader>
            <CardContent>
              {report?.products.length ? (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Sold</TableHead>
                        <TableHead className="text-right">Sales</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">Profit / loss</TableHead>
                        <TableHead className="text-right">Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.products.map((row) => (
                        <TableRow key={row.productId}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {row.productImage ? (
                                <Image
                                  src={row.productImage}
                                  alt={row.productName}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-md border object-cover"
                                />
                              ) : (
                                <span className="h-10 w-10 rounded-md border bg-muted" />
                              )}
                              <div className="min-w-0">
                                <Link
                                  href={`/admin/products/form?pid=${row.productId}`}
                                  className="line-clamp-1 font-medium hover:text-primary"
                                >
                                  {row.productName}
                                </Link>
                                {row.hasMissingCost && (
                                  <span className="flex items-center gap-1 text-xs text-amber-700">
                                    <AlertTriangle className="h-3 w-3" /> No cost price set
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{row.quantity}</TableCell>
                          <TableCell className="text-right">{money(row.revenue)}</TableCell>
                          <TableCell className="text-right">{money(row.cost)}</TableCell>
                          <TableCell className={cn("text-right font-semibold", profitClass(row.grossProfit))}>
                            {money(row.grossProfit)}
                          </TableCell>
                          <TableCell className={cn("text-right", profitClass(row.grossProfit))}>
                            {row.margin}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No products sold in this period.</p>
              )}
            </CardContent>
          </Card>

          {/* Expenses by category */}
          {!!report?.expensesByCategory.length && (
            <Card className="py-5">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Expenses by category</CardTitle>
                <Link href="/admin/accounts/expenses" className="text-sm font-medium text-primary hover:underline">
                  Manage expenses
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {report.expensesByCategory.map((row) => (
                    <div key={row.category} className="flex items-center justify-between rounded-lg border px-4 py-3">
                      <span className="text-sm">{row.category}</span>
                      <span className="font-semibold">{money(row.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfitLossReport;
