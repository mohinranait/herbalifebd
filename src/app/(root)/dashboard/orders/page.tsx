"use client";

import {
  Calendar,
  Eye,
  CreditCard,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useGetClientOrdersQuery } from "@/redux/service/orders";
import Pagination from "@/components/shared/Pagination";
import { useState } from "react";
import Analytics from "./components/Analytics";
import { statusStyles } from "@/components/shared/renderStatus";
import { CURRENCY } from "@/lib/envSecret";

export default function MyOrders() {
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const { data: getData, isLoading } = useGetClientOrdersQuery(`page=${pagination?.page}&limit=${pagination?.limit}`);
  const orders = getData?.data;
  const meta = getData?.meta;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            আমার অর্ডারসমূহ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            আপনার সকল অর্ডার ট্র্যাকিং ও বিস্তারিত তথ্য
          </p>
        </div>
        <Link href="/shop">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs sm:text-sm rounded-xl h-10 px-4">
            নতুন অর্ডার করুন
          </Button>
        </Link>
      </div>

      {/* Analytics */}
      <Analytics />

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Package className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-slate-700">কোনো অর্ডার পাওয়া যায়নি</p>
          <p className="text-xs text-slate-400 mt-1">শপ ব্রাউজ করে পছন্দের পণ্য অর্ডার করুন</p>
          <Link href="/shop" className="inline-block mt-4">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-xl h-9 px-4">
              শপিং করুন
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, orderIndex) => (
            <div
              key={orderIndex}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden transition-colors"
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        অর্ডারের তারিখ
                      </p>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-orange-500" />
                        <span>{format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        মোট প্রদেয়
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                        {CURRENCY} {order.pricing?.total?.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        অর্ডার স্ট্যাটাস
                      </p>
                      <span
                        className={cn(
                          "inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border mt-0.5",
                          statusStyles[order.orderStatus]
                        )}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  <Link href={`/dashboard/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="border-slate-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 rounded-xl text-xs font-semibold h-9">
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      বিস্তারিত দেখুন
                    </Button>
                  </Link>
                </div>

                <Separator className="my-3 bg-slate-200/60" />

                <div className="flex flex-wrap justify-between items-center text-xs text-slate-500 gap-2">
                  <span className="font-mono font-medium">ইনভয়েস: #{order?.invoiceNumber}</span>
                  <span>ট্র্যাকিং নম্বর: #{order?.trackingNumber || order?.invoiceNumber}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="py-3 px-4 sm:px-5 flex items-center justify-between bg-white text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                  <span>পেমেন্ট: {order?.payment?.method} ({order?.payment?.status})</span>
                </div>
                <div className="font-semibold text-slate-700">
                  {order?.items?.length || 0} টি পণ্য
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
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
      )}
    </div>
  );
}
