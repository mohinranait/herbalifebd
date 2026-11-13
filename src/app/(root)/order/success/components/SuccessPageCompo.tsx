"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGetOrderByTrackingNumberQuery } from "@/redux/service/orders";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  CheckCircle2,
  Receipt,
  Copy,
  Check,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Printer,
  Package,
  Calendar,
  CreditCard,
  Tag,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { PRODUCT_IMG } from "@/lib/default-import";
import { CURRENCY } from "@/lib/envSecret";
import { PaymentStatusBadge } from "@/components/shared/render-status";
import DeliveryTracker from "./DeliveryTracker";
import { SuccessPageSkeleton } from "./SuccessSkeleton";
import { useGetAppSettingQuery } from "@/redux/service/setting";
import WhatsAppIcon from "@/components/svg/WhatsApp";
import { formatWhatsappNumber } from "@/components/shared/WhatsAppButton";

const SuccessPageCompo = () => {
  const params = useSearchParams();
  const invoiceId = params.get("oid");
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useGetOrderByTrackingNumberQuery(invoiceId!, {
    skip: !invoiceId,
  });

  const { data: appSetting } = useGetAppSettingQuery();

  const order = data?.data;
  const items = order?.items || [];
  const trackingNumber = order?.trackingNumber || order?.invoiceNumber || invoiceId;

  const handleCopy = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      toast.success("ট্র্যাকিং নম্বর কপি করা হয়েছে!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <SuccessPageSkeleton />;
  }

  // If order not found or invalid URL
  if (!order || !invoiceId) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">কোনো অর্ডার পাওয়া যায়নি</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            আপনি যে ট্র্যাকিং নম্বরটি দিয়ে খুঁজছেন তা খুঁজে পাওয়া যায়নি অথবা ভুল হতে পারে।
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <Link
              href="/shop"
              className="flex-1 h-11 bg-brand hover:bg-brand-hover text-brand-foreground font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>শপে ফিরে যান</span>
            </Link>
            <Link
              href="/"
              className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center transition-colors"
            >
              হোম পেজ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = order?.createdAt
    ? format(new Date(order.createdAt), "dd MMM, yyyy - hh:mm a")
    : "";

  const paymentMethodLabel =
    order?.payment?.method === "COD"
      ? "ক্যাশ অন ডেলিভারি (Cash on Delivery)"
      : order?.payment?.method === "BKASH"
      ? "বিকাশ (bKash Online)"
      : order?.payment?.method === "NAGAD"
      ? "নগদ (Nagad Online)"
      : order?.payment?.method || "ক্যাশ অন ডেলিভারি";

  return (
    <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-4 md:px-6 bg-slate-50/60 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6">
        {/* 1. Header Celebratory Confirmation Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 text-center shadow-xs relative overflow-hidden print:border-none print:shadow-none">
          {/* Subtle decorative background tints */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-linear-to-b from-brand/10 to-transparent blur-2xl pointer-events-none" />

          {/* Success Checkmark with Pulse Ring */}
          <div className="relative inline-flex mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm ring-8 ring-emerald-50/80">
              <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            অর্ডার সফলভাবে গ্রহণ করা হয়েছে! 🎉
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
            ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত করা হয়েছে। খুব শীঘ্রই আমাদের কাস্টমার সাপোর্ট প্রতিনিধি এটি ডেলিভারির ব্যবস্থা করবেন।
          </p>

          {/* Order Meta Badges (Tracking & Txn ID) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-5">
            {/* Tracking ID Badge with 1-click Copy */}
            <div className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 transition-colors">
              <Receipt className="w-3.5 h-3.5 text-brand" />
              <span>ট্র্যাকিং নম্বর: #{trackingNumber}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-slate-400 hover:text-brand cursor-pointer p-0.5 transition-colors"
                title="ট্র্যাকিং নম্বর কপি করুন"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Date Badge */}
            {orderDate && (
              <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-3.5 py-1.5 rounded-full text-xs text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{orderDate}</span>
              </div>
            )}

            {/* Transaction ID if Mobile Banking */}
            {order?.payment?.transactionId && (
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-700">
                <span>Txt ID: #{order.payment.transactionId}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Left Column: Tracking & Ordered Items */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            {/* Delivery Progress Stepper */}
            <DeliveryTracker order={order} />

            {/* Ordered Products Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">
                    অর্ডারকৃত পণ্যসমূহ
                  </h3>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-0.5 rounded-full">
                  {items.length} টি আইটেম
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const productHref = item?.productSlug
                    ? `/products/${item.productSlug}`
                    : undefined;

                  return (
                    <div
                      key={item.id || idx}
                      className="py-3 sm:py-3.5 flex items-center gap-3 sm:gap-4 group"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden relative shrink-0 p-1">
                        <Image
                          src={item?.productImage || `/${PRODUCT_IMG}`}
                          alt={item?.productName || "Product"}
                          fill
                          sizes="64px"
                          className="object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        {productHref ? (
                          <Link
                            href={productHref}
                            className="text-xs sm:text-sm font-bold text-slate-800 hover:text-brand transition-colors line-clamp-1"
                          >
                            {item?.productName}
                          </Link>
                        ) : (
                          <p className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                            {item?.productName}
                          </p>
                        )}

                        {/* Selected Variants */}
                        {item?.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.selectedVariants).map(([key, val]) => (
                              <span
                                key={key}
                                className="inline-block text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded capitalize"
                              >
                                {key}: {val}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                          <span>
                            {CURRENCY}
                            {item.salePrice.toLocaleString()}
                          </span>
                          <span>×</span>
                          <span className="font-semibold text-slate-700">
                            {item.quantity} টি
                          </span>
                        </div>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                          {CURRENCY}
                          {(item.salePrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customer Note if exists */}
              {order?.customerNote && (
                <div className="mt-4 pt-3 border-t border-slate-100 bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-xs text-slate-700">
                  <span className="font-semibold text-amber-900 block mb-0.5">
                    অর্ডার নোট:
                  </span>
                  <p className="italic text-slate-600">{order.customerNote}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pricing Summary, Delivery Address & Actions */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            {/* Price & Payment Summary Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-3 mb-3 border-b border-slate-100 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand" />
                <span>পেমেন্ট ও মূল্য বিবরণী</span>
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>সাবটোটাল</span>
                  <span className="font-medium text-slate-800">
                    {CURRENCY} {order?.pricing?.subtotal?.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ</span>
                  {order?.pricing?.shippingCharge && order.pricing.shippingCharge > 0 ? (
                    <span className="font-medium text-slate-800">
                      {CURRENCY} {order.pricing.shippingCharge.toLocaleString()}
                    </span>
                  ) : (
                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                      ফ্রি ডেলিভারি
                    </span>
                  )}
                </div>

                {order?.pricing?.discount && order.pricing.discount > 0 ? (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>ডিসকাউন্ট ছাড়</span>
                    </span>
                    <span>– {CURRENCY} {order.pricing.discount.toLocaleString()}</span>
                  </div>
                ) : null}

                {order?.pricing?.tax && order.pricing.tax > 0 ? (
                  <div className="flex justify-between text-slate-600">
                    <span>ভ্যাট / ট্যাক্স</span>
                    <span className="font-medium text-slate-800">
                      {CURRENCY} {order.pricing.tax.toLocaleString()}
                    </span>
                  </div>
                ) : null}

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-sm sm:text-base font-bold text-slate-800">
                    সর্বমোট প্রদেয়
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold text-brand">
                    {CURRENCY} {order?.pricing?.total?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Details Section */}
              <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">পেমেন্ট মেথড:</span>
                  <span className="font-bold text-slate-800">{paymentMethodLabel}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">পেমেন্ট স্ট্যাটাস:</span>
                  <PaymentStatusBadge status={order?.payment?.status || "PENDING"} />
                </div>
              </div>
            </div>

            {/* Delivery Address Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-3 mb-3 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand" />
                <span>ডেলিভারি ঠিকানা</span>
              </h3>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order?.shippingAddress?.fullName}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={`tel:${order?.shippingAddress?.phone}`}
                    className="hover:text-brand transition-colors"
                  >
                    {order?.shippingAddress?.phone}
                  </a>
                </div>

                <div className="flex items-start gap-2 text-slate-600 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {order?.shippingAddress?.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 print:hidden">
              <Link
                href="/shop"
                className="w-full h-11.5 bg-brand hover:bg-brand-hover text-brand-foreground font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>আরও কেনাকাটা করুন</span>
              </Link>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="h-10 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>রসিদ প্রিন্ট</span>
                </button>

                <Link
                  href="/dashboard/orders"
                  className="h-10 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>আমার অর্ডার</span>
                </Link>
              </div>

              {/* Direct WhatsApp Support Button */}
              {appSetting?.contactPhone && (
                <a
                  href={`https://wa.me/${formatWhatsappNumber(
                    appSetting.contactPhone
                  )}?text=Hello,%20I%20have%20a%20question%20about%20Order%20%23${trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-emerald-600" />
                  <span>অর্ডার সম্পর্কিত সহায়তায় হোয়াটসঅ্যাপে কথা বলুন</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPageCompo;
