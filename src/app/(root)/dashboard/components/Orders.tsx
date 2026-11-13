'use client';

import { Button } from "@/components/ui/button";
import { useGetClientOrdersQuery } from "@/redux/service/orders";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CURRENCY } from "@/lib/envSecret";
import Link from "next/link";
import { Eye, Package, ArrowRight, ShoppingCart } from "lucide-react";
import { statusStyles } from "@/components/shared/renderStatus";

const Orders = () => {
  const { data: getData, isLoading } = useGetClientOrdersQuery('page=1&limit=5');
  const orders = getData?.data;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            সাম্প্রতিক অর্ডারসমূহ
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            আপনার অ্যাকাউন্টের সর্বশেষ অর্ডারের তালিকা
          </p>
        </div>

        {orders && orders.length > 0 && (
          <Link
            href="/dashboard/orders"
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 transition-colors"
          >
            <span>সবগুলো দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Orders List or Empty State */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            এখনও কোনো অর্ডার করেননি
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            আপনার পছন্দের পণ্যটি বেছে নিয়ে এখনই প্রথম অর্ডারটি সম্পন্ন করুন।
          </p>
          <Link href="/shop" className="inline-block mt-4">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-lg h-9 px-4">
              শপে কেনাকাটা করুন
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/40 transition-colors"
            >
              {/* Order Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    #{order.invoiceNumber}
                  </span>
                  <span
                    className={cn(
                      "inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      statusStyles[order.orderStatus]
                    )}
                  >
                    {order.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")} • {order?.items?.length || 0} টি পণ্য
                </p>
              </div>

              {/* Order Amount & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="font-bold text-sm sm:text-base text-slate-800">
                  {CURRENCY} {order.pricing?.total?.toLocaleString("en-IN")}
                </span>

                <Link href={`/dashboard/orders/${order.id}`}>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>বিস্তারিত</span>
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Button */}
      {orders && orders.length > 0 && (
        <div className="pt-2">
          <Link href="/dashboard/orders" className="block">
            <Button
              variant="outline"
              className="w-full border-slate-200 hover:bg-slate-50 hover:text-orange-600 text-slate-700 text-xs sm:text-sm font-medium h-10 rounded-xl"
            >
              <ShoppingCart className="w-4 h-4 mr-2 text-slate-500" />
              <span>আমার সকল অর্ডার দেখুন</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Orders;
