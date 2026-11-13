"use client";

import React from "react";
import { CreditCard, Wallet, Banknote, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IPayment } from "@/redux/service/orders/type";

interface MethodProps {
  payment?: IPayment;
}

const Method: React.FC<MethodProps> = ({ payment }) => {
  const method = payment?.method || "COD";
  const status = payment?.status || "PENDING";

  const getMethodMeta = (m: string) => {
    switch (m.toUpperCase()) {
      case "BKASH":
        return {
          label: "বিকাশ (bKash)",
          icon: Wallet,
          badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
          iconColor: "text-pink-600",
        };
      case "NAGAD":
        return {
          label: "নগদ (Nagad)",
          icon: Wallet,
          badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
          iconColor: "text-orange-600",
        };
      case "COD":
      default:
        return {
          label: "ক্যাশ অন ডেলিভারি (Cash on Delivery)",
          icon: Banknote,
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
          iconColor: "text-emerald-600",
        };
    }
  };

  const meta = getMethodMeta(method);
  const Icon = meta.icon;
  const isPaid = status === "PAID";

  return (
    <Card className="border border-slate-200/90 shadow-xs rounded-lg overflow-hidden bg-white">
      <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-orange-500" />
          <span>পেমেন্ট তথ্য</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
              <Icon className={`w-4 h-4 ${meta.iconColor}`} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">পেমেন্ট মাধ্যম</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{meta.label}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">পেমেন্ট স্ট্যাটাস:</span>
          {isPaid ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
              <CheckCircle className="w-3 h-3" />
              পরিশোধিত (Paid)
            </span>
          ) : status === "FAILED" ? (
            <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[11px]">
              <AlertCircle className="w-3 h-3" />
              ব্যর্থ (Failed)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
              <Clock className="w-3 h-3" />
              বকেয়া (Unpaid / COD)
            </span>
          )}
        </div>

        {payment?.transactionId && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Trx ID:</span>
            <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
              {payment.transactionId}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Method;
