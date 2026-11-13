"use client";

import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/hooks/hooks";
import { setLoginModalTab } from "@/redux/features/uiSlice";
import { useRegisterMutation } from "@/redux/service/auth";
import { registerSchema, TRegisterInputs } from "@/components/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock, UserPlus, Phone, User } from "lucide-react";

type RegisterFormProps = {
  onSwitchToLogin?: () => void;
  hideHeader?: boolean;
};

const RegisterForm = ({ onSwitchToLogin, hideHeader = false }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const form = useForm<TRegisterInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: TRegisterInputs) => {
    try {
      await register(data).unwrap();

      toast.success("অ্যাকাউন্ট তৈরি সফল হয়েছে! অনুগ্রহ করে লগইন করুন।");
      dispatch(setLoginModalTab({ tabValue: "login" }));
      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
    } catch (err: any) {
      console.error("Failed to register:", err);
      const fetchError = err as { data?: { error?: string } };
      let errorMessage = fetchError.data?.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে।";

      if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    }
  };

  const nameError = form.formState.errors.name;
  const phoneError = form.formState.errors.phone;
  const passwordError = form.formState.errors.password;

  return (
    <div className="w-full">
      {/* Header */}
      {!hideHeader && (
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            নতুন অ্যাকাউন্ট তৈরি করুন
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            সহজ কেনাকাটা ও দ্রুত ডেলিভারির জন্য সাইন আপ করুন
          </p>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-semibold text-slate-700">
            পূর্ণ নাম (Full Name)
          </label>
          <div className="relative group">
            <div
              className={cn(
                "absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none transition-colors",
                nameError
                  ? "text-rose-500"
                  : "text-slate-400 group-focus-within:text-orange-500"
              )}
            >
              <User className="w-4 h-4" />
            </div>

            <Input
              type="text"
              {...form.register("name")}
              placeholder="আপনার পুরো নাম লিখুন"
              className={cn(
                "pl-10.5 h-11 text-xs sm:text-sm bg-slate-50/50 rounded-xl transition-all border-slate-200 focus:bg-white focus:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20",
                nameError &&
                  "border-rose-400 focus:border-rose-500 focus-visible:ring-rose-500/20"
              )}
            />
          </div>
          {nameError && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
              <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
              {nameError.message}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center justify-between">
            <span>মোবাইল নম্বর</span>
            <span className="text-[11px] text-slate-400 font-normal">১১ ডিজিট</span>
          </label>
          <div className="relative group">
            <div
              className={cn(
                "absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none transition-colors",
                phoneError
                  ? "text-rose-500"
                  : "text-slate-400 group-focus-within:text-orange-500"
              )}
            >
              <Phone className="w-4 h-4" />
            </div>

            <Input
              type="tel"
              {...form.register("phone")}
              placeholder="01xxxxxxxxx"
              className={cn(
                "pl-10.5 h-11 text-xs sm:text-sm bg-slate-50/50 rounded-xl transition-all border-slate-200 focus:bg-white focus:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20",
                phoneError &&
                  "border-rose-400 focus:border-rose-500 focus-visible:ring-rose-500/20"
              )}
            />
          </div>
          {phoneError && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
              <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
              {phoneError.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-semibold text-slate-700">
            পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
          </label>
          <div className="relative group">
            <div
              className={cn(
                "absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none transition-colors",
                passwordError
                  ? "text-rose-500"
                  : "text-slate-400 group-focus-within:text-orange-500"
              )}
            >
              <Lock className="w-4 h-4" />
            </div>

            <Input
              type={showPassword ? "text" : "password"}
              {...form.register("password")}
              placeholder="••••••••"
              className={cn(
                "pl-10.5 pr-10.5 h-11 text-xs sm:text-sm bg-slate-50/50 rounded-xl transition-all border-slate-200 focus:bg-white focus:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20",
                passwordError &&
                  "border-rose-400 focus:border-rose-500 focus-visible:ring-rose-500/20"
              )}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5"
              aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {passwordError && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
              <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
              {passwordError.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11.5 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              অ্যাকাউন্ট তৈরি হচ্ছে...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              অ্যাকাউন্ট তৈরি করুন
            </span>
          )}
        </button>

        {/* Switch to Login */}
        {onSwitchToLogin && (
          <p className="text-center text-xs text-slate-500 pt-2">
            আগে থেকেই অ্যাকাউন্ট আছে?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-orange-600 hover:text-orange-700 font-semibold hover:underline cursor-pointer transition-colors"
            >
              সাইন ইন করুন
            </button>
          </p>
        )}
      </form>
    </div>
  );
};

export default RegisterForm;
