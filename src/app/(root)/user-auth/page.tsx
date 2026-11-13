"use client";

import React, { useState, Suspense } from "react";
import LoginForm from "../components/login-form";
import RegisterForm from "../components/register-form";
import HeaderLogo from "@/components/shared/HeaderLogo";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { userLogout } from "@/redux/features/authSlice";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  Truck,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  LogIn,
  UserPlus,
} from "lucide-react";

function UserAuthContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);

  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // If user is already authenticated
  if (user?._id) {
    return (
      <div className="min-h-[calc(100vh-140px)] py-12 px-4 flex items-center justify-center bg-linear-to-b from-orange-50/40 via-slate-50 to-orange-50/20">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-orange-500 to-amber-500 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md mb-4 uppercase">
            {user?.name?.[0] || "U"}
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            আপনি ইতিমধ্যে লগইন করা আছেন
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            স্বাগতম, <span className="font-semibold text-slate-700">{user.name}</span>
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href={user?.role === "Admin" ? "/admin" : "/dashboard"}
              className="h-11 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ড্যাশবোর্ড এ যান</span>
            </Link>

            <Link
              href="/shop"
              className="h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>কেনাকাটা চালিয়ে যান</span>
            </Link>

            <button
              type="button"
              onClick={() => dispatch(userLogout())}
              className="h-10 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট করুন</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] py-8 sm:py-12 md:py-16 px-4 flex items-center justify-center bg-linear-to-b from-orange-50/50 via-slate-50 to-orange-50/30 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="w-full max-w-4xl relative z-10">
        {/* Main Combined Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-slate-200/90 rounded-3xl shadow-xl overflow-hidden">
          {/* Left Hero / Brand Banner (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 bg-linear-to-br from-orange-500 via-amber-500 to-orange-600 p-8 sm:p-10 text-white flex-col justify-between relative overflow-hidden">
            {/* Background pattern circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-black/10 rounded-full blur-xl pointer-events-none" />

            {/* Top brand */}
            <div className="relative z-10">
              <div className="inline-block bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-white mb-6 border border-white/30">
                ✨ বিশ্বস্ত অনলাইন শপিং
              </div>
              <h2 className="text-2xl font-bold leading-tight">
                আপনার পছন্দের পণ্যের সেরা কেনাকাটা
              </h2>
              <p className="text-xs text-orange-100 mt-2 leading-relaxed">
                লগইন করে উপভোগ করুন আকর্ষণীয় অফার, দ্রুত চেকআউট এবং সহজ ডেলিভারি ট্র্যাকিং।
              </p>
            </div>

            {/* Feature Perks */}
            <div className="relative z-10 my-8 space-y-3.5">
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-white">
                  <Zap className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">এক্সক্লুসিভ অফার ও ডিসকাউন্ট</h4>
                  <p className="text-[11px] text-orange-100/90 leading-snug mt-0.5">
                    লগইন করা গ্রাহকদের জন্য বিশেষ ছাড়
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-white">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">সহজ অর্ডার ট্র্যাকিং</h4>
                  <p className="text-[11px] text-orange-100/90 leading-snug mt-0.5">
                    রিয়েল-টাইম ডেলিভারি আপডেট পান
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">১০০% নিরাপদ শপিং</h4>
                  <p className="text-[11px] text-orange-100/90 leading-snug mt-0.5">
                    আপনার তথ্যের সুরক্ষা আমাদের অগ্রাধিকার
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Trust Badge */}
            <div className="relative z-10 pt-4 border-t border-white/20 flex items-center gap-3">
              <div className="flex -space-x-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-white/30 border border-white/50 flex items-center justify-center text-[10px] font-bold"
                  >
                    ★
                  </div>
                ))}
              </div>
              <p className="text-xs text-orange-100 font-medium">
                ১০,০০০+ সন্তুষ্ট গ্রাহকের বিশ্বস্ত প্রতিষ্ঠান
              </p>
            </div>
          </div>

          {/* Right Form Container */}
          <div className="col-span-12 lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
            {/* Top Back Link & Mobile Logo */}
            <div className="flex items-center justify-between mb-5">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-orange-600 transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>হোম পেজে ফিরুন</span>
              </Link>

              <div className="lg:hidden">
                <HeaderLogo />
              </div>
            </div>

            {/* Login vs Register Switcher */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl mb-6 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={cn(
                  "h-11 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none",
                  activeTab === "login"
                    ? "bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                )}
              >
                <LogIn className="w-4 h-4" />
                <span>লগইন</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={cn(
                  "h-11 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none",
                  activeTab === "register"
                    ? "bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                )}
              >
                <UserPlus className="w-4 h-4" />
                <span>রেজিস্ট্রেশন</span>
              </button>
            </div>

            {/* Active Form */}
            <div className="w-full">
              {activeTab === "login" ? (
                <LoginForm onSwitchToRegister={() => setActiveTab("register")} />
              ) : (
                <RegisterForm onSwitchToLogin={() => setActiveTab("login")} />
              )}
            </div>

            {/* Bottom Terms Notice */}
            <p className="text-center text-[11px] text-slate-400 mt-6 leading-relaxed">
              লগইন বা রেজিস্ট্রেশন করার মাধ্যমে আপনি আমাদের{" "}
              <Link href="/terms" className="text-slate-600 hover:underline">
                ব্যবহারের শর্তাবলী
              </Link>{" "}
              ও{" "}
              <Link href="/privacy" className="text-slate-600 hover:underline">
                গোপনীয়তা নীতি
              </Link>{" "}
              মেনে নিচ্ছেন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      }
    >
      <UserAuthContent />
    </Suspense>
  );
}
