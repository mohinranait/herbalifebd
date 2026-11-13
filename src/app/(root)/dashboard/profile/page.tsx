"use client";

import { useAppSelector } from "@/hooks/hooks";
import { useGetUserByIdQuery } from "@/redux/service/users";
import ProfileForm from "./components/ProfileForm";
import { UserCheck } from "lucide-react";

export default function UpdateProfile() {
  const { user } = useAppSelector((state) => state.auth);

  const { data, isLoading: getUserLoading } = useGetUserByIdQuery(
    user?.id as string,
    {
      skip: !user?.id,
    }
  );

  const findUser = data?.data;

  if (getUserLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-white border border-slate-200 rounded-2xl animate-pulse" />
        <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!findUser) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
        প্রোফাইল তথ্য লোড করা যায়নি
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brand" />
            <span>প্রোফাইল সেটিংস</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            আপনার ব্যক্তিগত তথ্য ও অ্যাকাউন্টের নিরাপত্তা পর্যবেক্ষণ করুন
          </p>
        </div>
      </div>

      {/* Main Profile Form & Details */}
      <ProfileForm findUser={findUser} />
    </div>
  );
}
