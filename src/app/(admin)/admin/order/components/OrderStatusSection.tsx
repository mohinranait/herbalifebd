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
  ChevronRight,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOrderStatus } from "@/redux/service/orders/type";

interface Props {
  status: TOrderStatus;
  onQuickStatusChange?: (newStatus: TOrderStatus) => void;
  isUpdating?: boolean;
}

const steps = [
  {
    key: "PENDING",
    label: "Pending",
    subLabel: "Awaiting review",
    icon: Clock,
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    subLabel: "Order accepted",
    icon: CheckCircle2,
  },
  {
    key: "PROCESSING",
    label: "Processing",
    subLabel: "Packing & ready",
    icon: Package,
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    subLabel: "In transit / courier",
    icon: Truck,
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    subLabel: "Completed",
    icon: Check,
  },
];

const OrderStatusSection: React.FC<Props> = ({
  status = "PENDING",
  onQuickStatusChange,
  isUpdating = false,
}) => {
  const isCancelled = status === "CANCELLED";
  const isReturned = status === "RETURNED";

  const statusMap: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    PROCESSING: 2,
    SHIPPED: 3,
    DELIVERED: 4,
  };

  const currentIndex = statusMap[status] ?? 0;

  // Next logical status to advance the order
  const getNextStatusAction = (): { nextStatus: TOrderStatus; label: string } | null => {
    switch (status) {
      case "PENDING":
        return { nextStatus: "CONFIRMED", label: "Confirm Order" };
      case "CONFIRMED":
        return { nextStatus: "PROCESSING", label: "Start Processing" };
      case "PROCESSING":
        return { nextStatus: "SHIPPED", label: "Mark as Shipped" };
      case "SHIPPED":
        return { nextStatus: "DELIVERED", label: "Mark as Delivered" };
      default:
        return null;
    }
  };

  const nextAction = getNextStatusAction();

  if (isCancelled) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-900">Order Cancelled</p>
            <p className="text-xs text-red-700 mt-0.5">
              Order items have been restored to inventory stock.
            </p>
          </div>
        </div>

        {onQuickStatusChange && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUpdating}
            onClick={() => onQuickStatusChange("PENDING")}
            className="h-8 text-xs font-semibold rounded-md border-red-300 text-red-700 hover:bg-red-100"
          >
            Re-open Order
          </Button>
        )}
      </div>
    );
  }

  if (isReturned) {
    return (
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900">Order Returned</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Marked as returned and inventory has been adjusted.
            </p>
          </div>
        </div>

        {onQuickStatusChange && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUpdating}
            onClick={() => onQuickStatusChange("PENDING")}
            className="h-8 text-xs font-semibold rounded-md border-amber-300 text-amber-800 hover:bg-amber-100"
          >
            Reset Status
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 5-Step Progress Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {steps.map((step, idx) => {
          const isCompleted = currentIndex > idx;
          const isCurrent = currentIndex === idx;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              onClick={() => {
                if (onQuickStatusChange && !isUpdating) {
                  onQuickStatusChange(step.key as TOrderStatus);
                }
              }}
              title={`Click to set status to ${step.label}`}
              className={`p-3 rounded-md border text-left cursor-pointer transition-all select-none ${
                isCompleted
                  ? "bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50"
                  : isCurrent
                  ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                  : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                </span>

                <Icon
                  className={`w-4 h-4 ${
                    isCompleted
                      ? "text-emerald-600"
                      : isCurrent
                      ? "text-primary"
                      : "text-slate-400"
                  }`}
                />
              </div>

              <p
                className={`text-xs font-bold ${
                  isCompleted
                    ? "text-emerald-900"
                    : isCurrent
                    ? "text-primary"
                    : "text-slate-600"
                }`}
              >
                {step.label}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{step.subLabel}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Advance Bar */}
      {nextAction && onQuickStatusChange && (
        <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-200/90">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ArrowRight className="w-4 h-4 text-primary" />
            <span>
              Next Step: <strong className="text-slate-800">{nextAction.nextStatus}</strong>
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            disabled={isUpdating}
            onClick={() => onQuickStatusChange(nextAction.nextStatus)}
            className="h-8 px-3 text-xs font-bold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
          >
            <span>{nextAction.label}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderStatusSection;
