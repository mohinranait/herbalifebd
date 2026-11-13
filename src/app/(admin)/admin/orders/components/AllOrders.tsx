'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Clock,
  Package,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  SlidersHorizontal,
  XCircle,
  RotateCcw,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table/Table';
import Pagination from '@/components/shared/Pagination';
import { useGetAdminOrdersQuery } from '@/redux/service/orders';
import { CURRENCY } from '@/lib/envSecret';
import Filters from './filters';
import { columns } from './columns';

/* -------------------------------------------------------------------------- */
/*                               STATUS TABS                                  */
/* -------------------------------------------------------------------------- */
const STATUS_TABS = [
  { label: 'All Orders', value: 'all', key: 'all' },
  { label: 'Pending', value: 'PENDING', key: 'pending' },
  { label: 'Confirmed', value: 'CONFIRMED', key: 'confirmed' },
  { label: 'Processing', value: 'PROCESSING', key: 'processing' },
  { label: 'Shipped', value: 'SHIPPED', key: 'shipped' },
  { label: 'Delivered', value: 'DELIVERED', key: 'delivered' },
  { label: 'Cancelled', value: 'CANCELLED', key: 'cancelled' },
  { label: 'Returned', value: 'RETURNED', key: 'returned' },
];

const AllOrders = () => {
  const [isParams, setIsParams] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 15 });

  const queryParams = `page=${pagination?.page}&limit=${pagination?.limit}&${isParams}`;
  const { data, isLoading, isFetching, refetch } = useGetAdminOrdersQuery(queryParams);

  const orders = data?.data || [];
  const meta = data?.meta;
  const summary = meta?.summary;

  const handleStatusTabClick = (status: string) => {
    setSelectedStatus(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getStatusCount = (key: string) => {
    if (!summary) return null;
    return (summary as any)[key] ?? 0;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* -------------------------------------------------------------------- */}
      {/* HEADER                                                               */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Orders Management
            </h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold">
              {meta?.total || 0} Total
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Track customer orders, check payment details, process shipments & download invoices.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="h-9 gap-1.5 text-xs bg-background"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-primary' : ''}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* KPI METRIC CARDS                                                     */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total Orders Card */}
        <div
          onClick={() => handleStatusTabClick('all')}
          className={`p-3.5 rounded-xl border bg-card cursor-pointer transition-all hover:shadow-sm ${
            selectedStatus === 'all'
              ? 'border-primary ring-2 ring-primary/20 shadow-xs'
              : 'hover:border-foreground/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Orders</span>
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-2">
            {summary?.all ?? meta?.total ?? 0}
          </p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">All active orders</span>
        </div>

        {/* Pending Card */}
        <div
          onClick={() => handleStatusTabClick('PENDING')}
          className={`p-3.5 rounded-xl border bg-card cursor-pointer transition-all hover:shadow-sm ${
            selectedStatus === 'PENDING'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
              : 'hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pending</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-2 text-amber-600 dark:text-amber-400">
            {summary?.pending ?? 0}
          </p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Awaiting confirmation</span>
        </div>

        {/* Processing / Confirmed Card */}
        <div
          onClick={() => handleStatusTabClick('PROCESSING')}
          className={`p-3.5 rounded-xl border bg-card cursor-pointer transition-all hover:shadow-sm ${
            selectedStatus === 'PROCESSING' || selectedStatus === 'CONFIRMED'
              ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'hover:border-blue-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Processing</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-2 text-blue-600 dark:text-blue-400">
            {(summary?.processing ?? 0) + (summary?.confirmed ?? 0)}
          </p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            {summary?.confirmed ?? 0} conf • {summary?.processing ?? 0} proc
          </span>
        </div>

        {/* Delivered Card */}
        <div
          onClick={() => handleStatusTabClick('DELIVERED')}
          className={`p-3.5 rounded-xl border bg-card cursor-pointer transition-all hover:shadow-sm ${
            selectedStatus === 'DELIVERED'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
              : 'hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Delivered</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">
            {summary?.delivered ?? 0}
          </p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Successfully completed</span>
        </div>

        {/* Total Revenue Card */}
        <div className="p-3.5 rounded-xl border bg-card col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Delivered Sales</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold mt-2 text-purple-600 dark:text-purple-400">
            {CURRENCY} {Number(summary?.totalRevenue || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">From delivered orders</span>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* STATUS TABS PILL BAR                                                 */}
      {/* -------------------------------------------------------------------- */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 border-b pb-2 min-w-max">
          {STATUS_TABS.map((tab) => {
            const count = getStatusCount(tab.key);
            const isActive = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleStatusTabClick(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span>{tab.label}</span>
                {count !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* FILTERS BAR                                                          */}
      {/* -------------------------------------------------------------------- */}
      <Filters
        setParams={setIsParams}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />

      {/* -------------------------------------------------------------------- */}
      {/* TABLE CARD                                                           */}
      {/* -------------------------------------------------------------------- */}
     

        <CardContent className="p-0 bg-white">
          <div className="overflow-x-auto">
            <DataTable columns={columns} data={orders} loading={isLoading} />
          </div>
        </CardContent>


      {/* Pagination */}
      <div className="pt-2">
        <Pagination
          page={meta?.page || 1}
          totalPages={meta?.totalPages || 1}
          onPageChange={(page) =>
            setPagination((prev) => ({
              ...prev,
              page,
            }))
          }
        />
      </div>
    </div>
  );
};

export default AllOrders;
