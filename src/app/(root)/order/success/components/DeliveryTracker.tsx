"use client";

import { IOrder, TOrderStatus } from "@/redux/service/orders/type";
import { addDays, format } from "date-fns";
import { Check, Clock, Package, Truck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  order: IOrder;
};

export default function DeliveryTracker({ order }: Props) {
  const status = order?.orderStatus || "CONFIRMED";

  // Calculate dynamic steps based on order.orderStatus
  const getStepState = (stepIndex: number): "done" | "active" | "pending" => {
    const statusOrder: Record<TOrderStatus, number> = {
      PENDING: 1,
      CONFIRMED: 1,
      PROCESSING: 2,
      SHIPPED: 3,
      DELIVERED: 4,
      CANCELLED: 0,
      RETURNED: 0,
    };

    const currentLevel = statusOrder[status] || 1;

    if (currentLevel > stepIndex) return "done";
    if (currentLevel === stepIndex) return "active";
    return "pending";
  };

  const steps = [
    {
      index: 1,
      title: "অর্ডার গ্রহণ",
      desc: "অর্ডার কনফার্ম হয়েছে",
      icon: CheckCircle2,
      state: getStepState(1),
    },
    {
      index: 2,
      title: "প্রসেসিং",
      desc: "পণ্য প্রস্তুত করা হচ্ছে",
      icon: Package,
      state: getStepState(2),
    },
    {
      index: 3,
      title: "ডেলিভারির পথে",
      desc: "কুরিয়ারে হস্তান্তর",
      icon: Truck,
      state: getStepState(3),
    },
    {
      index: 4,
      title: "ডেলিভারি সম্পন্ন",
      desc: "গ্রাহকের হাতে পৌঁছানো",
      icon: Check,
      state: getStepState(4),
    },
  ];

  const estimatedStart = order?.createdAt
    ? format(addDays(new Date(order.createdAt), 2), "dd MMM")
    : "";
  const estimatedEnd = order?.createdAt
    ? format(addDays(new Date(order.createdAt), 4), "dd MMM, yyyy")
    : "";

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-light text-brand flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              ডেলিভারি ট্র্যাকিং স্ট্যাটাস
            </h3>
            <p className="text-xs text-slate-500">
              আপনার অর্ডারের বর্তমান অগ্রগতি
            </p>
          </div>
        </div>

        {order?.createdAt && (
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-400 block">সম্ভাব্য ডেলিভারি</span>
            <span className="text-xs font-bold text-brand">
              {estimatedStart} – {estimatedEnd}
            </span>
          </div>
        )}
      </div>

      {/* Progress Stepper */}
      <div className="relative flex items-start justify-between px-2 sm:px-4">
        {steps.map((step, idx) => {
          const isDone = step.state === "done";
          const isActive = step.state === "active";
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className="relative flex flex-col items-center flex-1 text-center group"
            >
              {/* Connector line between steps */}
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-4 left-1/2 w-full h-[3px] -translate-y-1/2 z-0 transition-colors",
                    isDone ? "bg-emerald-500" : "bg-slate-200"
                  )}
                />
              )}

              {/* Step Circle Indicator */}
              <div
                className={cn(
                  "relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs",
                  isDone && "bg-emerald-500 text-white shadow-emerald-500/20",
                  isActive &&
                    "bg-brand text-brand-foreground ring-4 ring-brand/20 shadow-brand/30 animate-pulse",
                  step.state === "pending" && "bg-slate-100 text-slate-400 border border-slate-200"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Step Labels */}
              <div className="mt-2.5 max-w-[80px] sm:max-w-[110px]">
                <p
                  className={cn(
                    "text-xs sm:text-sm leading-tight",
                    isActive && "font-bold text-brand",
                    isDone && "font-semibold text-slate-800",
                    step.state === "pending" && "text-slate-400 font-medium"
                  )}
                >
                  {step.title}
                </p>
                <span className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block mt-0.5 leading-snug">
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Estimated Delivery Footer */}
      {order?.createdAt && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:hidden">
          <span className="text-slate-500">সম্ভাব্য ডেলিভারি:</span>
          <span className="font-bold text-brand">
            {estimatedStart} – {estimatedEnd}
          </span>
        </div>
      )}
    </div>
  );
}
