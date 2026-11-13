'use client';

import {
  Package,
  CreditCard,
  Clock,
  PiggyBank,
} from "lucide-react";
import { useGetDashboardAnalyticsQuery } from "@/redux/client/dashboard";
import { CURRENCY } from "@/lib/envSecret";

const Analytics = () => {
  const { data: getAnalaytics, isLoading } = useGetDashboardAnalyticsQuery('');
  const analaytics = getAnalaytics?.data;

  const stats = [
    {
      title: "মোট অর্ডার",
      englishTitle: "Total Orders",
      value: analaytics?.totalOrders ?? 0,
      description: "আপনার মোট অর্ডারের সংখ্যা",
      icon: Package,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50 border border-blue-100",
    },
    {
      title: "মোট কেনাকাটা",
      englishTitle: "Total Spent",
      value: `${CURRENCY} ${(analaytics?.totalShopping || 0).toLocaleString("en-IN")}`,
      description: "সফলভাবে পরিশোধিত মূল্য",
      icon: CreditCard,
      iconColor: "text-brand",
      bgColor: "bg-brand-light border border-brand-border",
    },
    {
      title: "চলতি অর্ডার",
      englishTitle: "Pending Orders",
      value: analaytics?.ordersByStatus?.PENDING ?? 0,
      description: "প্রক্রিয়াধীন অর্ডারের সংখ্যা",
      icon: Clock,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50 border border-amber-100",
    },
    {
      title: "মোট সেভিংস",
      englishTitle: "Total Savings",
      value: `${CURRENCY} ${(analaytics?.totalSaving || 0).toLocaleString("en-IN")}`,
      description: "অফার ও ডিসকাউন্ট থেকে সঞ্চয়",
      icon: PiggyBank,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50 border border-emerald-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 line-clamp-1">
                {stat.title}
              </span>
              <div className={`p-2 rounded-xl shrink-0 ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
            </div>

            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight block">
                {stat.value}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {stat.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Analytics;
