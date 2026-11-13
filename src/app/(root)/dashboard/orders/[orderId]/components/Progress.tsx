"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Check,
  XCircle,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TOrderStatus } from "@/redux/service/orders/type";

interface ProgressProps {
  orderStatus: TOrderStatus;
  deliveredAt?: string | Date | null;
  cancelledAt?: string | Date | null;
}

const positiveSteps = [
  {
    key: "PENDING",
    label: "অর্ডার গৃহীত",
    subLabel: "Order Placed",
    icon: Clock,
  },
  {
    key: "CONFIRMED",
    label: "নিশ্চিত হয়েছে",
    subLabel: "Confirmed",
    icon: CheckCircle2,
  },
  {
    key: "PROCESSING",
    label: "প্রস্তুত হচ্ছে",
    subLabel: "Processing",
    icon: Package,
  },
  {
    key: "SHIPPED",
    label: "ডেলিভারির পথে",
    subLabel: "On the way",
    icon: Truck,
  },
  {
    key: "DELIVERED",
    label: "ডেলিভার্ড",
    subLabel: "Delivered",
    icon: Check,
  },
];

const Progress: React.FC<ProgressProps> = ({
  orderStatus = "PENDING",
}) => {
  const isCancelled = orderStatus === "CANCELLED";
  const isReturned = orderStatus === "RETURNED";

  const statusOrderIndex: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    PROCESSING: 2,
    SHIPPED: 3,
    DELIVERED: 4,
  };

  const currentStepIndex = statusOrderIndex[orderStatus] ?? 0;

  return (
    <Card className="border border-slate-200/90 shadow-xs rounded-lg overflow-hidden bg-white">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              অর্ডার ট্র্যাকিং স্ট্যাটাস
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              লাইভ ডেলিভারি অগ্রগতি পর্যবেক্ষণ করুন
            </p>
          </div>
          {isCancelled ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
              <XCircle className="w-3.5 h-3.5" />
              বাতিল (Cancelled)
            </span>
          ) : isReturned ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <RotateCcw className="w-3.5 h-3.5" />
              পণ্য ফেরত (Returned)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {positiveSteps[currentStepIndex]?.label || orderStatus}
            </span>
          )}
        </div>

        {isCancelled ? (
          <div className="p-3.5 rounded-md bg-red-50/70 border border-red-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-red-800">
                এই অর্ডারটি বাতিল করা হয়েছে
              </p>
              <p className="text-xs text-red-600/90 mt-0.5 leading-relaxed">
                আপনার কোনো জিজ্ঞাসা থাকলে আমাদের গ্রাহক সহায়তায় যোগাযোগ করুন।
              </p>
            </div>
          </div>
        ) : isReturned ? (
          <div className="p-3.5 rounded-md bg-amber-50/70 border border-amber-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-800">
                পণ্যটি রিটার্ন হিসেবে চিহ্নিত হয়েছে
              </p>
              <p className="text-xs text-amber-700/90 mt-0.5 leading-relaxed">
                পণ্য রিটার্ন বা রিফান্ড সংক্রান্ত যেকোনো তথ্যের জন্য হেল্পলাইনে যোগাযোগ করুন।
              </p>
            </div>
          </div>
        ) : (
          <div className="relative pt-1">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 relative">
              {/* Connecting line */}
              <div
                className="absolute top-4 sm:top-5 left-[10%] right-[10%] h-0.5 bg-slate-100 -translate-y-1/2 z-0 hidden sm:block"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-brand transition-all duration-500"
                  style={{
                    width: `${(currentStepIndex / (positiveSteps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {positiveSteps.map((step, idx) => {
                const isCompleted = currentStepIndex > idx;
                const isCurrent = currentStepIndex === idx;
                const Icon = step.icon;

                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center text-center relative z-10"
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center transition-all duration-300 shadow-xs ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-brand text-brand-foreground ring-2 ring-brand/30"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <p
                      className={`text-[11px] sm:text-xs font-bold mt-2 line-clamp-1 ${
                        isCompleted
                          ? "text-emerald-700"
                          : isCurrent
                          ? "text-brand"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
                      {step.subLabel}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Progress;
