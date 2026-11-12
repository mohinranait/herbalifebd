"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  LayoutDashboard,
  User2,
  Package,
  Store,
  ShieldCheck,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useLogoutMutation } from "@/redux/service/auth";
import { userLogout } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";
import { cn } from "@/lib/utils";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const path = usePathname();
  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(userLogout());
    } catch (error) {
      console.log({ error });
      handleErrors(error as ErrorResponse);
    }
  };

  const tabs = [
    {
      label: "ড্যাশবোর্ড ওভারভিউ",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "আমার অর্ডারসমূহ",
      href: "/dashboard/orders",
      icon: Package,
    },
    {
      label: "প্রোফাইল সেটিংস",
      href: "/dashboard/profile",
      icon: User2,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-8 px-3 sm:px-4">
      <div className=" mx-auto max-w-[1100px] space-y-5">
        {/* 1. Top Profile Info Banner (Always visible across all tabs) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Avatar & User Info */}
            <div className="flex items-center gap-3.5 sm:gap-4">
              <Avatar className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-orange-200 bg-orange-50 text-orange-600 shrink-0">
                <AvatarFallback className="text-xl sm:text-2xl font-bold uppercase bg-linear-to-tr from-orange-500 to-amber-500 text-white rounded-2xl">
                  {user?.name ? user.name.charAt(0) : "U"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 line-clamp-1">
                    {user?.name || "সম্মানিত গ্রাহক"}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>ভেরিফাইড অ্যাকাউন্ট</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                  {user?.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {/* {user?.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span className="line-clamp-1">{user.email}</span>
                    </div>
                  )} */}
                </div>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 self-end sm:self-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 text-slate-700 hover:text-orange-600 text-xs sm:text-sm font-medium transition-colors"
              >
                <Store className="w-4 h-4 text-slate-400" />
                <span>শপে যান</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 hover:border-rose-300 text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>লগআউট</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Modern Horizontal Navigation Tabs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = path === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isActive ? "text-white" : "text-slate-400"
                  )}
                />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>

        {/* 3. Tab Body View (Full Width Content) */}
        <main className="w-full min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default ProfileLayout;
