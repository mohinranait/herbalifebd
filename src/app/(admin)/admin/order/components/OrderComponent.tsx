"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  User,
  Truck,
  Receipt,
  Download,
  Loader2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetOrderByIdAdminQuery,
  useUpdateOrderByIdAdminMutation,
} from "@/redux/service/orders";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/shared/render-status";
import { CURRENCY } from "@/lib/envSecret";
import OrderStatusSection from "./OrderStatusSection";
import OrderItemTable from "./OrderItemTable";
import OrderUpdateForm from "./OrderUpdateForm";
import WhatsAppIcon from "@/components/svg/WhatsApp";
import { formatWhatsappNumber } from "@/components/shared/WhatsAppButton";
import { formateDownloadInvoice } from "@/app/(root)/dashboard/orders/[orderId]/components/download-invoice";
import { TOrderStatus } from "@/redux/service/orders/type";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";
import { toast } from "sonner";

interface Props {
  orderId: string;
}

const OrderComponent: React.FC<Props> = ({ orderId }) => {
  const router = useRouter();
  const { data, isLoading } = useGetOrderByIdAdminQuery(orderId, {
    skip: !orderId,
  });
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderByIdAdminMutation();

  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const order = data?.data;
  const shipping = order?.shippingAddress;
  const pricing = order?.pricing;

  const handleCopyInvoice = () => {
    if (order?.invoiceNumber) {
      navigator.clipboard.writeText(order.invoiceNumber);
      setCopied(true);
      toast.success("Invoice number copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setIsDownloading(true);
    try {
      await formateDownloadInvoice(order);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate invoice.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleQuickStatusChange = async (newStatus: TOrderStatus) => {
    if (!order?.id) return;
    try {
      await updateOrder({
        id: order.id,
        payload: {
          orderStatus: newStatus,
        },
      }).unwrap();
      toast.success(`Order status updated to '${newStatus}'!`);
    } catch (error) {
      handleErrors(error as ErrorResponse);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto p-4 sm:p-6 animate-pulse">
        <div className="h-12 bg-slate-200 rounded-md w-72" />
        <div className="h-20 bg-slate-200 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-md" />
          <div className="h-96 bg-slate-200 rounded-md" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
        <p className="text-base font-bold text-slate-700">Order not found</p>
        <Button
          onClick={() => router.push("/admin/orders")}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-xs font-semibold"
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  const rawPhone = shipping?.phone ? formatWhatsappNumber(shipping.phone) : "";

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12 p-3 sm:p-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.back()}
            type="button"
            size="icon"
            variant="outline"
            className="h-9 w-9 rounded-md border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                #{order.invoiceNumber}
              </h1>
              <button
                onClick={handleCopyInvoice}
                type="button"
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                title="Copy Invoice"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <OrderStatusBadge status={order.orderStatus} />
              <PaymentStatusBadge status={order.payment?.status} />
            </div>

            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              <span>
                Date:{" "}
                {order.createdAt
                  ? format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")
                  : "N/A"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            onClick={handleDownloadInvoice}
            disabled={isDownloading}
            type="button"
            size="sm"
            className="h-8.5 px-3 text-xs font-bold rounded-md bg-orange-500 hover:bg-orange-600 text-white gap-1.5 shadow-xs transition-all"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Invoice PDF</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            Order Status
          </p>
          <div className="mt-1">
            <OrderStatusBadge status={order.orderStatus} />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            Payment Status
          </p>
          <div className="mt-1">
            <PaymentStatusBadge status={order.payment?.status} />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            Payment Method
          </p>
          <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1 uppercase">
            {order.payment?.method || "COD"}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            Total Amount
          </p>
          <p className="text-sm sm:text-base font-extrabold text-emerald-600 mt-0.5">
            {CURRENCY} {(pricing?.total || 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (Lifecycle Stepper & Items Table) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status Stepper Card */}
          <Card className="border border-slate-200/90 shadow-xs rounded-lg overflow-hidden bg-white">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-500" />
                <span>Order Progress Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <OrderStatusSection
                status={order.orderStatus}
                onQuickStatusChange={handleQuickStatusChange}
                isUpdating={isUpdating}
              />
            </CardContent>
          </Card>

          {/* Items Table */}
          <OrderItemTable order={order} />
        </div>

        {/* Right Column (Manage Order, Customer Info, Shipping) */}
        <div className="space-y-5">
          {/* Order Update Form */}
          <OrderUpdateForm order={order} />

          {/* Customer Details Card */}
          <Card className="border border-slate-200/90 shadow-xs rounded-lg overflow-hidden bg-white">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {shipping?.fullName || "N/A"}
                </p>
                {order.userId && (
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    User ID: {order.userId}
                  </p>
                )}
              </div>

              {shipping?.phone && (
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <a
                    href={`tel:${shipping.phone}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Call ({shipping.phone})</span>
                  </a>

                  {rawPhone && (
                    <a
                      href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(
                        `Hello ${shipping.fullName}, your order #${order.invoiceNumber} from Herbalife BD is being processed.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition-colors"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              )}

              <div className="pt-2.5 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>Shipping Address:</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-5">
                  {shipping?.address}
                  {shipping?.postalCode ? ` - ${shipping.postalCode}` : ""}
                </p>
              </div>

              {(order.courierName || order.trackingNumber) && (
                <div className="pt-2.5 border-t border-slate-100 space-y-1 text-xs bg-slate-50 p-2.5 rounded-md">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Truck className="w-3.5 h-3.5 text-orange-500" />
                    <span>Courier & Tracking:</span>
                  </div>
                  {order.courierName && (
                    <p className="text-slate-600">
                      Courier: <strong className="text-slate-800">{order.courierName}</strong>
                    </p>
                  )}
                  {order.trackingNumber && (
                    <p className="text-slate-600 font-mono">
                      Tracking: <strong className="text-slate-800">{order.trackingNumber}</strong>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderComponent;
