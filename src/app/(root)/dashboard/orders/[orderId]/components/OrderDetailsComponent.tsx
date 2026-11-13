"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Download,
  Package,
  MapPin,
  Calendar,
  Hash,
  ArrowLeft,
  Copy,
  Check,
  Phone,
  Truck,
  Loader2,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetOrderByIdAdminQuery } from "@/redux/service/orders";
import { CURRENCY } from "@/lib/envSecret";
import { toast } from "sonner";
import OrderItem from "./OrderItem";
import Progress from "./Progress";
import Method from "./Method";
import { formateDownloadInvoice } from "./download-invoice";
import WhatsAppIcon from "@/components/svg/WhatsApp";
import { formatWhatsappNumber } from "@/components/shared/WhatsAppButton";
import { useGetAppSettingQuery } from "@/redux/service/setting";

interface Props {
  orderId: string;
}

export default function OrderDetailsComponent({ orderId }: Props) {
  const router = useRouter();
  const { data, isLoading } = useGetOrderByIdAdminQuery(orderId, {
    skip: !orderId,
  });
  const { data: settingData } = useGetAppSettingQuery();

  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const order = data?.data;
  const address = order?.shippingAddress;
  const pricing = order?.pricing;

  const handleCopyInvoice = () => {
    if (order?.invoiceNumber) {
      navigator.clipboard.writeText(order.invoiceNumber);
      setCopied(true);
      toast.success("ইনভয়েস নম্বর কপি করা হয়েছে!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setIsDownloading(true);
    try {
      await formateDownloadInvoice(order);
      toast.success("ইনভয়েস সফলভাবে ডাউনলোড হয়েছে!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("ইনভয়েস তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse max-w-6xl mx-auto py-5 px-4">
        <div className="h-10 bg-slate-200 rounded-md w-48" />
        <div className="h-24 bg-slate-200 rounded-lg" />
        <div className="h-64 bg-slate-200 rounded-lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-14 h-14 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
          <Package className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">অর্ডারটি পাওয়া যায়নি</h2>
        <p className="text-xs text-slate-500 mt-1">
          অর্ডার আইডি ভুল হতে পারে অথবা ডিলিট করা হয়েছে।
        </p>
        <Button
          onClick={() => router.push("/dashboard/orders")}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-xs font-semibold"
        >
          অর্ডার তালিকায় ফিরে যান
        </Button>
      </div>
    );
  }

  const whatsappPhone =
    formatWhatsappNumber(settingData?.contactPhone || "") || "8801728068200";

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-10">
      {/* Top Breadcrumb & Action Header */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.back()}
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-md border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 shrink-0"
              title="পিছনে যান"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-800">
                  অর্ডার বিস্তারিত
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-100 uppercase">
                  #{order.invoiceNumber}
                </span>
                <button
                  onClick={handleCopyInvoice}
                  type="button"
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title="কপি করুন"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                অর্ডারের তারিখ:{" "}
                {order.createdAt
                  ? format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
              type="button"
              size="sm"
              className="h-9 px-3.5 text-xs font-bold rounded-md bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-xs transition-all"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>ইনভয়েস ডাউনলোড</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase">
            <Calendar className="w-3.5 h-3.5 text-orange-500" />
            <span>তারিখ</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
            {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy") : "N/A"}
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase">
            <Hash className="w-3.5 h-3.5 text-orange-500" />
            <span>ইনভয়েস #</span>
          </div>
          <p className="text-xs sm:text-sm font-mono font-bold text-slate-800 mt-1 uppercase truncate">
            {order.invoiceNumber}
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase">
            <Truck className="w-3.5 h-3.5 text-orange-500" />
            <span>কুরিয়ার / ট্র্যাকিং</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1 truncate">
            {order.courierName || "স্ট্যান্ডার্ড ডেলিভারি"}
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase">
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>সর্বমোট পরিশোধযোগ্য</span>
          </div>
          <p className="text-sm sm:text-base font-extrabold text-emerald-600 mt-0.5">
            {CURRENCY} {(pricing?.total || 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (Items & Stepper) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Live Order Stepper */}
          <Progress
            orderStatus={order.orderStatus}
            deliveredAt={order.deliveredAt}
            cancelledAt={order.cancelledAt}
          />

          {/* Items Card */}
          <Card className="border border-slate-200/90 shadow-xs rounded-lg overflow-hidden bg-white">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-500" />
                <span>অর্ডারকৃত পণ্যসমূহ</span>
              </CardTitle>
              <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                মোট {order.items?.length || 0}টি পণ্য
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {order.items?.map((item, idx) => (
                <OrderItem key={idx} item={item} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Summary, Address, Payment, Support) */}
        <div className="space-y-5">
          {/* Order Financial Summary */}
          <Card className="border border-slate-200/90 shadow-xs rounded-lg overflow-hidden bg-white">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-orange-500" />
                <span>হিসাব বিবরণী (Summary)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>পণ্যের মোট মূল্য:</span>
                <span className="font-semibold text-slate-800">
                  {CURRENCY} {(pricing?.subtotal || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-semibold text-slate-800">
                  {pricing?.shippingCharge
                    ? `${CURRENCY} ${pricing.shippingCharge.toLocaleString("en-IN")}`
                    : "ফ্রি (Free)"}
                </span>
              </div>

              {pricing?.tax && pricing.tax > 0 ? (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>ভ্যাট / ট্যাক্স:</span>
                  <span className="font-semibold text-slate-800">
                    {CURRENCY} {pricing.tax.toLocaleString("en-IN")}
                  </span>
                </div>
              ) : null}

              {pricing?.discount && pricing.discount > 0 ? (
                <div className="flex justify-between text-xs text-emerald-600 font-medium">
                  <span>ডিসকাউন্ট ({order.coupon?.code || "কুপন"}):</span>
                  <span>- {CURRENCY} {pricing.discount.toLocaleString("en-IN")}</span>
                </div>
              ) : null}

              <Separator />

              <div className="flex justify-between items-center text-xs font-bold text-slate-900 pt-0.5">
                <span>সর্বমোট:</span>
                <span className="text-base font-extrabold text-orange-600">
                  {CURRENCY} {(pricing?.total || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border border-slate-200/90 shadow-xs rounded-lg overflow-hidden bg-white">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>ডেলিভারি ঠিকানা</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-bold text-slate-800">
                {address?.fullName || "N/A"}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a
                  href={`tel:${address?.phone}`}
                  className="font-semibold text-slate-800 hover:text-orange-600 transition-colors"
                >
                  {address?.phone}
                </a>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                {address?.address}
                {address?.postalCode ? ` - ${address.postalCode}` : ""}
              </p>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Method payment={order.payment} />

          {/* Need Help Box */}
          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <WhatsAppIcon className="w-4 h-4 fill-current" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-emerald-900">
                অর্ডার সংক্রান্ত সহায়তা চান?
              </h4>
              <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                যেকোনো প্রশ্ন বা ট্র্যাকিং সমস্যার জন্য সরাসরি WhatsApp-এ মেসেজ করুন।
              </p>
              <a
                href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                  `Hello, I need assistance with my order #${order.invoiceNumber}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <span>WhatsApp-এ মেসেজ করুন</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
