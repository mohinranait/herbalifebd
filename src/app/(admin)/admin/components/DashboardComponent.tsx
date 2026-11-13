"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  Users,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Eye,
  DollarSign,
  Receipt,
  Layers,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDashboardAnalyticsQuery,
  useDashboardRevenueQuery,
} from "@/redux/service/dashboard";
import { OrderStatusBadge } from "@/components/shared/render-status";
import { CURRENCY } from "@/lib/envSecret";

const DashboardComponent = () => {
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year">("month");
  const [activeProductTab, setActiveProductTab] = useState<"top" | "alerts">("top");

  // Fetch Analytics & Revenue
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    isFetching: analyticsFetching,
    refetch: refetchAnalytics,
  } = useDashboardAnalyticsQuery("");

  const {
    data: revenueData,
    isLoading: revenueLoading,
    isFetching: revenueFetching,
    refetch: refetchRevenue,
  } = useDashboardRevenueQuery(`period=${period}`);

  const handleRefreshAll = () => {
    refetchAnalytics();
    refetchRevenue();
  };

  const isRefreshing = analyticsFetching || revenueFetching;

  const dashboard = analyticsData?.data;
  const sales = dashboard?.sales;
  const orders = dashboard?.orders;
  const inventory = dashboard?.inventory;
  const customers = dashboard?.customers;
  const expenses = dashboard?.expenses;
  const profit = dashboard?.profit;
  const topProducts = dashboard?.topSellingProducts || [];
  const lowStockItems = inventory?.lowStockItems || [];
  const recentOrders = dashboard?.recentOrders || [];

  const chartData = revenueData?.data || [];
  const periodRevenue = revenueData?.meta?.totalRevenue ?? 0;
  const periodOrders = revenueData?.meta?.totalOrders ?? 0;

  // Order status pipeline calculations
  const totalOrdersCount = orders?.total || 1;
  const pipeline = [
    {
      label: "Pending",
      count: orders?.pending || 0,
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
      href: "/admin/orders?status=PENDING",
    },
    {
      label: "Confirmed",
      count: orders?.confirmed || 0,
      color: "bg-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
      href: "/admin/orders?status=CONFIRMED",
    },
    {
      label: "Processing",
      count: orders?.processing || 0,
      color: "bg-indigo-500",
      textColor: "text-indigo-600 dark:text-indigo-400",
      href: "/admin/orders?status=PROCESSING",
    },
    {
      label: "Shipped",
      count: orders?.shipped || 0,
      color: "bg-cyan-500",
      textColor: "text-cyan-600 dark:text-cyan-400",
      href: "/admin/orders?status=SHIPPED",
    },
    {
      label: "Delivered",
      count: orders?.delivered || 0,
      color: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      href: "/admin/orders?status=DELIVERED",
    },
    {
      label: "Cancelled / Returned",
      count: (orders?.cancelled || 0) + (orders?.returned || 0),
      color: "bg-rose-500",
      textColor: "text-rose-600 dark:text-rose-400",
      href: "/admin/orders?status=CANCELLED",
    },
  ];

  const currentDateFormatted = format(new Date(), "EEEE, dd MMMM yyyy");

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-10">
      {/* -------------------------------------------------------------------- */}
      {/* 1. EXECUTIVE HEADER (CLEAN & SHARP)                                  */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-card border border-border/80 rounded-lg p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Store Command Center</span>
            <span>•</span>
            <span>{currentDateFormatted}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mt-1">
            Business Dashboard & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time overview of revenue, active orders, inventory alerts & customer trends.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="h-8.5 px-3 text-xs gap-1.5 rounded-md bg-background"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/admin/products/form">
            <Button size="sm" className="h-8.5 px-3 text-xs font-semibold gap-1.5 rounded-md">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </Button>
          </Link>

          <Link href="/admin/orders">
            <Button variant="secondary" size="sm" className="h-8.5 px-3 text-xs font-medium gap-1.5 rounded-md">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. PRIMARY 4 HERO KPI CARDS                                          */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Delivered Revenue */}
        <div className="bg-card border border-border/80 rounded-lg p-4 shadow-2xs hover:border-border transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Delivered Revenue
            </span>
            <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            {analyticsLoading ? (
              <Skeleton className="h-7 w-28 my-0.5" />
            ) : (
              <p className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {CURRENCY} {Number(sales?.totalRevenue || 0).toLocaleString()}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                +{CURRENCY} {Number(sales?.todayRevenue || 0).toLocaleString()}
              </span>
              <span>today</span>
              <span>•</span>
              <span>{CURRENCY} {Number(sales?.thisMonthRevenue || 0).toLocaleString()} mo</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-card border border-border/80 rounded-lg p-4 shadow-2xs hover:border-border transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            {analyticsLoading ? (
              <Skeleton className="h-7 w-20 my-0.5" />
            ) : (
              <p className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {orders?.total || 0}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1.5">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                +{orders?.today || 0} today
              </span>
              <span>•</span>
              <span>+{orders?.thisMonth || 0} this month</span>
            </div>
          </div>
        </div>

        {/* Pending Orders (Needs Action) */}
        <Link href="/admin/orders?status=PENDING" className="block group">
          <div className="bg-card border border-border/80 rounded-lg p-4 shadow-2xs hover:border-amber-500/40 transition-colors h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pending Orders
              </span>
              <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              {analyticsLoading ? (
                <Skeleton className="h-7 w-16 my-0.5" />
              ) : (
                <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                  {orders?.pending || 0}
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] mt-1.5">
                <span className="text-muted-foreground">Awaiting confirmation</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5 group-hover:underline">
                  Process <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Estimated Net Profit (This Month) */}
        <Link href="/admin/accounts/profit-loss" className="block group">
          <div className="bg-card border border-border/80 rounded-lg p-4 shadow-2xs hover:border-purple-500/40 transition-colors h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Est. Net Profit (Mo)
              </span>
              <div className="w-8 h-8 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              {analyticsLoading ? (
                <Skeleton className="h-7 w-24 my-0.5" />
              ) : (
                <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                  {CURRENCY} {Number(profit?.estimatedNet || 0).toLocaleString()}
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                <span>Exp: {CURRENCY} {Number(expenses?.thisMonth || 0).toLocaleString()}</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-0.5 group-hover:underline">
                  P&L Report <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. SECONDARY QUICK STATS STRIP                                       */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Avg Order Value */}
        <div className="bg-card border border-border/80 rounded-lg px-3.5 py-3 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide truncate">
              Avg. Order Value
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {CURRENCY} {Number(sales?.averageOrderValue || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Total Customers */}
        <Link
          href="/admin/users"
          className="bg-card border border-border/80 rounded-lg px-3.5 py-3 shadow-2xs flex items-center gap-3 hover:bg-muted/30 transition-colors"
        >
          <div className="w-8 h-8 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide truncate">
              Customers
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5 truncate">
              {customers?.total || 0}{" "}
              <span className="text-[11px] font-normal text-muted-foreground">
                (+{customers?.newThisMonth || 0} mo)
              </span>
            </p>
          </div>
        </Link>

        {/* Inventory In-Stock */}
        <Link
          href="/admin/products"
          className="bg-card border border-border/80 rounded-lg px-3.5 py-3 shadow-2xs flex items-center gap-3 hover:bg-muted/30 transition-colors"
        >
          <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide truncate">
              Active Catalog
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {inventory?.totalProducts || 0} products
            </p>
          </div>
        </Link>

        {/* Low Stock Alerts */}
        <div
          onClick={() => setActiveProductTab("alerts")}
          className={`bg-card border border-border/80 rounded-lg px-3.5 py-3 shadow-2xs flex items-center gap-3 cursor-pointer transition-colors ${
            (inventory?.outOfStock || 0) + (inventory?.lowStock || 0) > 0
              ? "hover:border-amber-500/50"
              : ""
          }`}
        >
          <div className="w-8 h-8 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide truncate">
              Stock Warnings
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              <span className="text-rose-600 dark:text-rose-400 font-extrabold">{inventory?.outOfStock || 0} Out</span>
              <span className="text-muted-foreground font-normal"> • </span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold">{inventory?.lowStock || 0} Low</span>
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 4. MAIN ANALYTICS ROW: REVENUE CHART + ORDER FULFILLMENT PIPELINE     */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* REVENUE & ORDERS CHART (8 Cols) */}
        <Card className="lg:col-span-8 rounded-lg border border-border/80 shadow-2xs overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border/70 bg-muted/20 gap-3">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold">Revenue & Order Trends</CardTitle>
              <CardDescription className="text-xs">
                Performance tracking over time for delivered customer orders.
              </CardDescription>
            </div>

            {/* Time Period Filter Tabs */}
            <div className="flex items-center gap-1 bg-muted p-0.5 rounded-md self-start sm:self-auto border border-border/40">
              {(
                [
                  { label: "Today", value: "today" },
                  { label: "7D", value: "week" },
                  { label: "30D", value: "month" },
                  { label: "1Y", value: "year" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setPeriod(tab.value)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                    period === tab.value
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5">
            {/* Period Summary Pills */}
            <div className="flex flex-wrap items-center gap-4 mb-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-muted-foreground">Period Revenue:</span>
                <span className="font-bold text-foreground">
                  {CURRENCY} {Number(periodRevenue).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <span className="text-muted-foreground">Period Orders:</span>
                <span className="font-bold text-foreground">{periodOrders} orders</span>
              </div>
            </div>

            {/* Chart Area */}
            {revenueLoading ? (
              <div className="h-[240px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                  <span>Loading revenue data...</span>
                </div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs">
                No revenue recorded in this period.
              </div>
            ) : (
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                      className="text-muted-foreground"
                      tickFormatter={(v) => `${v}`}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-popover border border-border shadow-md rounded-md p-2.5 text-xs space-y-1">
                              <p className="font-semibold text-foreground">{item.label}</p>
                              <p className="text-blue-600 font-bold">
                                Revenue: {CURRENCY} {Number(item.revenue || 0).toLocaleString()}
                              </p>
                              <p className="text-muted-foreground">Orders: {item.orders || 0}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ORDER PIPELINE BREAKDOWN (4 Cols) */}
        <Card className="lg:col-span-4 rounded-lg border border-border/80 shadow-2xs flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border/70 bg-muted/20">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold">Order Fulfillment</CardTitle>
              <CardDescription className="text-xs">Live order status distribution</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-semibold rounded">
              {orders?.total || 0} Total
            </Badge>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              {pipeline.map((item) => {
                const pct = Math.round((item.count / totalOrdersCount) * 100) || 0;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block group hover:bg-muted/40 p-1.5 rounded-md transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${item.color}`} />
                        {item.label}
                      </span>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        <strong className="text-foreground">{item.count}</strong> ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border/60 mt-3">
              <Link
                href="/admin/orders"
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>Manage all orders in table view</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 5. OPERATIONAL DETAILS: RECENT ORDERS & PRODUCTS TAB                  */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* RECENT ORDERS LIST (7 Cols) */}
        <Card className="lg:col-span-7 rounded-lg border border-border/80 shadow-2xs overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border/70 bg-muted/20">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold">Recent Customer Orders</CardTitle>
              <CardDescription className="text-xs">
                Latest transactions and delivery requests
              </CardDescription>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-primary gap-1 px-2 rounded">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0 flex-1">
            {analyticsLoading ? (
              <div className="p-4 space-y-2.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-11 w-full rounded" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No orders placed yet.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentOrders.map((order: any) => {
                  const itemsCount = order.items?.length || order.totalItems || 1;
                  const firstItemName = order.items?.[0]?.productName || "Order Item";
                  return (
                    <div
                      key={order.id}
                      className="px-4 py-3 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      {/* Left: Customer & Invoice */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/order/${order.id}`}
                            className="font-mono font-bold text-primary hover:underline text-[11px]"
                          >
                            #{order.invoiceNumber}
                          </Link>
                          <span className="font-semibold text-foreground truncate max-w-[120px] sm:max-w-[180px]">
                            {order.shippingAddress?.fullName || order.user?.name || "Customer"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {firstItemName} {itemsCount > 1 ? `(+${itemsCount - 1} more)` : ""} •{" "}
                          {order.createdAt ? format(new Date(order.createdAt), "dd MMM, hh:mm a") : ""}
                        </p>
                      </div>

                      {/* Middle: Method & Status */}
                      <div className="hidden sm:flex flex-col items-end gap-1">
                        <OrderStatusBadge status={order.orderStatus} />
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {order.payment?.method || "COD"} • {order.payment?.status || "PENDING"}
                        </span>
                      </div>

                      {/* Right: Amount & View */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="font-bold text-xs sm:text-sm text-foreground">
                            {CURRENCY} {Number(order.pricing?.total || order.total || 0).toLocaleString()}
                          </p>
                          <div className="sm:hidden mt-0.5">
                            <OrderStatusBadge status={order.orderStatus} />
                          </div>
                        </div>

                        <Link href={`/admin/order/${order.id}`}>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground rounded">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* TOP PRODUCTS & INVENTORY ALERTS TABS (5 Cols) */}
        <Card className="lg:col-span-5 rounded-lg border border-border/80 shadow-2xs overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border/70 bg-muted/20">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold">Catalog Intelligence</CardTitle>
              <CardDescription className="text-xs">Top performers & restock triggers</CardDescription>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center gap-1 bg-muted p-0.5 rounded-md border border-border/40">
              <button
                type="button"
                onClick={() => setActiveProductTab("top")}
                className={`px-2 py-0.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                  activeProductTab === "top"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Top Selling
              </button>
              <button
                type="button"
                onClick={() => setActiveProductTab("alerts")}
                className={`px-2 py-0.5 text-xs font-semibold rounded transition-all cursor-pointer flex items-center gap-1 ${
                  activeProductTab === "alerts"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Alerts</span>
                {lowStockItems.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1">
            {activeProductTab === "top" ? (
              // Top Selling List
              topProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No sales recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {topProducts.map((p: any) => (
                    <div key={p.id} className="px-4 py-2.5 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8.5 h-8.5 rounded border bg-muted overflow-hidden shrink-0">
                          {p.thumbnail ? (
                            <Image src={p.thumbnail} alt={p.name} fill sizes="34px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-muted-foreground/60" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-[180px]">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {CURRENCY} {Number(p.price || 0).toLocaleString()} • Stock: {p.stock || 0}
                          </p>
                        </div>
                      </div>

                      <Badge variant="secondary" className="font-bold text-[10px] shrink-0 rounded px-1.5 py-0.5">
                        {p.totalSold || 0} Sold
                      </Badge>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Low Stock & Out of Stock Alerts
              lowStockItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500/80" />
                  <span>All products have healthy inventory levels!</span>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {lowStockItems.map((item: any) => (
                    <div key={item.id} className="px-4 py-2.5 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8.5 h-8.5 rounded border bg-muted overflow-hidden shrink-0">
                          {item.thumbnail ? (
                            <Image src={item.thumbnail} alt={item.name} fill sizes="34px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-muted-foreground/60" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-[180px]">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Price: {CURRENCY} {Number(item.price || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.stock <= 0 ? (
                          <Badge variant="destructive" className="text-[10px] font-bold rounded px-1.5 py-0.5">
                            Out of Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 rounded px-1.5 py-0.5">
                            {item.stock} left
                          </Badge>
                        )}
                        <Link href={`/admin/products/form?id=${item.id}&mode=edit`}>
                          <Button size="sm" variant="ghost" className="h-6.5 text-[11px] px-1.5 text-primary rounded">
                            Restock
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </CardContent>

          <div className="px-4 py-2.5 border-t border-border/60 bg-muted/10 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Manage entire catalog:</span>
            <Link href="/admin/products" className="font-semibold text-primary hover:underline flex items-center gap-1">
              <span>View Products</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 6. BUSINESS MANAGEMENT SHORTCUT TILES (COMPACT & BALANCED)            */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
        <Link
          href="/admin/orders"
          className="bg-card border border-border/80 rounded-lg p-3 hover:border-primary/50 hover:bg-muted/20 transition-all flex flex-col items-center text-center group shadow-2xs"
        >
          <div className="w-8.5 h-8.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="font-semibold text-xs text-foreground">Orders List</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Process sales</span>
        </Link>

        <Link
          href="/admin/products"
          className="bg-card border border-border/80 rounded-lg p-3 hover:border-primary/50 hover:bg-muted/20 transition-all flex flex-col items-center text-center group shadow-2xs"
        >
          <div className="w-8.5 h-8.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Package className="w-4 h-4" />
          </div>
          <span className="font-semibold text-xs text-foreground">Products</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Catalog & stock</span>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-card border border-border/80 rounded-lg p-3 hover:border-primary/50 hover:bg-muted/20 transition-all flex flex-col items-center text-center group shadow-2xs"
        >
          <div className="w-8.5 h-8.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-semibold text-xs text-foreground">Categories</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Shop taxonomy</span>
        </Link>

        <Link
          href="/admin/accounts/profit-loss"
          className="bg-card border border-border/80 rounded-lg p-3 hover:border-primary/50 hover:bg-muted/20 transition-all flex flex-col items-center text-center group shadow-2xs"
        >
          <div className="w-8.5 h-8.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="font-semibold text-xs text-foreground">Profit & Loss</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Net margins</span>
        </Link>

        <Link
          href="/admin/accounts/expenses"
          className="bg-card border border-border/80 rounded-lg p-3 hover:border-primary/50 hover:bg-muted/20 transition-all flex flex-col items-center text-center group shadow-2xs"
        >
          <div className="w-8.5 h-8.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Receipt className="w-4 h-4" />
          </div>
          <span className="font-semibold text-xs text-foreground">Expenses</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Cost logging</span>
        </Link>

        <Link
          href="/admin/users"
          className="bg-card border border-border/80 rounded-lg p-3 hover:border-primary/50 hover:bg-muted/20 transition-all flex flex-col items-center text-center group shadow-2xs"
        >
          <div className="w-8.5 h-8.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <span className="font-semibold text-xs text-foreground">Customers</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">User accounts</span>
        </Link>
      </div>
    </div>
  );
};

export default DashboardComponent;
