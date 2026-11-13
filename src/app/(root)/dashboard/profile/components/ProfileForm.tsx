"use client";

import { Button } from "@/components/ui/button";
import { LoaderCircle, Pen, Save, X, Lock, ShieldCheck, Calendar, User, Phone, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { useUpdateUserMutation } from "@/redux/service/users";
import { IUser } from "@/redux/service/users/type";
import { TUserInput } from "@/components/validations/user.schema";
import { toast } from "sonner";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";
import { format } from "date-fns";

type Props = {
  findUser: IUser;
};

const ProfileForm = ({ findUser }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const initializeRef = useRef(false);
  const [updateUser, { isLoading: updateLoading }] = useUpdateUserMutation();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (findUser && !initializeRef.current) {
      setFormData({
        name: findUser?.name || "",
        phone: findUser?.phone || "",
      });
      initializeRef.current = true;
    }
  }, [findUser]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning("দয়া করে আপনার নাম লিখুন");
      return;
    }

    const payload: TUserInput = {
      name: formData.name.trim(),
      phone: findUser.phone,
      role: findUser.role,
      status: findUser.status,
    };

    try {
      await updateUser({ payload, id: findUser.id }).unwrap();
      toast.success("প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!");
      setIsEditing(false);
    } catch (error) {
      console.log({ error });
      handleErrors(error as ErrorResponse);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: findUser?.name || "",
      phone: findUser?.phone || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Personal Information Edit Card */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              <span>ব্যক্তিগত তথ্য</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              আপনার নাম ও যোগাযোগের তথ্য এখান থেকে পরিবর্তন করুন
            </p>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Pen className="w-3.5 h-3.5" />
              <span>তথ্য এডিট করুন</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="submit"
                disabled={updateLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {updateLoading ? (
                  <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>সংরক্ষণ করুন</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={updateLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>বাতিল</span>
              </button>
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
              আপনার পূর্ণ নাম
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              placeholder="আপনার নাম লিখুন"
              className="h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-orange-500 disabled:bg-slate-50 disabled:text-slate-700"
            />
            {isEditing && (
              <p className="text-[11px] text-slate-400">
                অর্ডার ইনভয়েস ও ডেলিভারিতে এই নামটি ব্যবহৃত হবে।
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                মোবাইল নাম্বার
              </Label>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                <Lock className="w-2.5 h-2.5" />
                <span>স্থায়ী নম্বর</span>
              </span>
            </div>
            <div className="relative">
              <Input
                id="phone"
                value={formData.phone}
                readOnly
                disabled
                className="h-10 text-xs sm:text-sm border-slate-200 bg-slate-50 text-slate-600 pl-8 cursor-not-allowed"
              />
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-slate-400">
              অ্যাকাউন্টের নিরাপত্তার স্বার্থে মোবাইল নাম্বার পরিবর্তনযোগ্য নয়।
            </p>
          </div>
        </div>
      </form>

      {/* 2. Account Overview & Security Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Account Details Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-800">
              অ্যাকাউন্ট স্ট্যাটাস
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">গ্রাহক আইডি:</span>
              <span className="font-mono font-bold text-slate-800">
                #{findUser?.id ? findUser.id.slice(-6).toUpperCase() : "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">অ্যাকাউন্টের ধরন:</span>
              <span className="font-semibold text-slate-800 capitalize">
                {findUser?.role === "Admin" ? "অ্যাডমিনিস্ট্রেটর" : "সাধারণ গ্রাহক"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">ভেরিফিকেশন:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                <CheckCircle2 className="w-3 h-3" />
                <span>যাচাইকৃত প্রোফাইল</span>
              </span>
            </div>
          </div>
        </div>

        {/* Membership Info Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-800">
              যোগদানের তথ্য
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">যোগদানের তারিখ:</span>
              <span className="font-semibold text-slate-800">
                {findUser?.createdAt
                  ? format(new Date(findUser.createdAt), "dd MMMM, yyyy")
                  : "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">অ্যাকাউন্ট স্ট্যাটাস:</span>
              <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                {findUser?.status ? "সক্রিয় (Active)" : "নিষ্ক্রিয়"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">পাসওয়ার্ড সিকিউরিটি:</span>
              <span className="font-semibold text-slate-700">সুরক্ষিত</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
