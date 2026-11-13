"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Save, Truck, CreditCard, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";
import { useUpdateOrderByIdAdminMutation } from "@/redux/service/orders";
import {
  IOrder,
  TOrderStatus,
  TPaymentMethod,
  TPaymentStatus,
} from "@/redux/service/orders/type";
import { toast } from "sonner";

export interface IOrderUpdaeView {
  orderStatus?: TOrderStatus;
  payment?: {
    status?: TPaymentStatus;
    method?: TPaymentMethod;
  };
  courierName?: string;
  trackingNumber?: string;
  adminNote?: string;
}

const COMMON_COURIERS = [
  "Steadfast Courier",
  "Pathao Courier",
  "RedX Logistics",
  "Paperfly",
  "Sundarban Courier",
  "eCourier",
  "SA Paribahan",
  "Own Delivery",
];

interface Props {
  order: IOrder;
}

const OrderUpdateForm: React.FC<Props> = ({ order }) => {
  const [updateOrder, { isLoading }] = useUpdateOrderByIdAdminMutation();

  const [orderStatus, setOrderStatus] = useState<TOrderStatus>(
    (order?.orderStatus as TOrderStatus) || "PENDING"
  );
  const [paymentStatus, setPaymentStatus] = useState<TPaymentStatus>(
    (order?.payment?.status as TPaymentStatus) || "PENDING"
  );
  const [paymentMethod, setPaymentMethod] = useState<TPaymentMethod>(
    (order?.payment?.method as TPaymentMethod) || "COD"
  );
  const [courierName, setCourierName] = useState<string>(
    order?.courierName || ""
  );
  const [trackingNumber, setTrackingNumber] = useState<string>(
    order?.trackingNumber || ""
  );
  const [adminNote, setAdminNote] = useState<string>(
    order?.adminNote || ""
  );

  // Sync state if order prop changes
  useEffect(() => {
    if (order) {
      setOrderStatus((order.orderStatus as TOrderStatus) || "PENDING");
      setPaymentStatus((order.payment?.status as TPaymentStatus) || "PENDING");
      setPaymentMethod((order.payment?.method as TPaymentMethod) || "COD");
      setCourierName(order.courierName || "");
      setTrackingNumber(order.trackingNumber || "");
      setAdminNote(order.adminNote || "");
    }
  }, [order]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order?.id) return;

    try {
      await updateOrder({
        id: order.id,
        payload: {
          orderStatus,
          payment: {
            status: paymentStatus,
            method: paymentMethod,
          },
          courierName: courierName.trim() || undefined,
          trackingNumber: trackingNumber.trim() || undefined,
          adminNote: adminNote.trim() || undefined,
        },
      }).unwrap();

      toast.success("Order updated successfully!");
    } catch (error) {
      handleErrors(error as ErrorResponse);
    }
  };

  return (
    <form
      onSubmit={handleUpdate}
      className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-lg shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Order Control Panel</h3>
          <p className="text-xs text-slate-400">Manage status, payment & courier</p>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          size="sm"
          className="h-8 px-3 text-xs font-bold rounded-md bg-orange-500 hover:bg-orange-600 text-white gap-1.5 shadow-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Update Order</span>
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3.5">
        {/* Status & Payment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Order Status
            </label>
            <Select
              value={orderStatus}
              onValueChange={(val: TOrderStatus) => setOrderStatus(val)}
            >
              <SelectTrigger className="w-full h-8.5 text-xs rounded-md border-slate-200 bg-slate-50/50">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="RETURNED">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Payment Status
            </label>
            <Select
              value={paymentStatus}
              onValueChange={(val: TPaymentStatus) => setPaymentStatus(val)}
            >
              <SelectTrigger className="w-full h-8.5 text-xs rounded-md border-slate-200 bg-slate-50/50">
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending (Unpaid / COD)</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Courier Section */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Truck className="w-3.5 h-3.5 text-orange-500" />
            <span>Courier & Parcel Tracking</span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500">
              Courier Partner
            </label>
            <div className="flex gap-2">
              <Select
                value={COMMON_COURIERS.includes(courierName) ? courierName : "custom"}
                onValueChange={(val) => {
                  if (val !== "custom") setCourierName(val);
                }}
              >
                <SelectTrigger className="w-full h-8.5 text-xs rounded-md border-slate-200 bg-slate-50/50">
                  <SelectValue placeholder="Select courier" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_COURIERS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Other / Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(!COMMON_COURIERS.includes(courierName) || courierName === "") && (
              <Input
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                placeholder="Enter courier name"
                className="h-8.5 text-xs rounded-md border-slate-200 mt-1"
              />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500">
              Consignment / Tracking Number
            </label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. SF9482942 / REDX-091"
              className="h-8.5 text-xs rounded-md border-slate-200 font-mono"
            />
          </div>
        </div>

        {/* Admin Note Section */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <FileText className="w-3.5 h-3.5 text-orange-500" />
            <span>Internal Admin Note</span>
          </div>
          <Textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Add internal instructions or private notes for staff..."
            rows={2}
            className="text-xs rounded-md border-slate-200 resize-none"
          />
        </div>
      </div>
    </form>
  );
};

export default OrderUpdateForm;
