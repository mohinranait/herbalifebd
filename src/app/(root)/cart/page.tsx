"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { removeToCart, updateCartQuantity, clearShoppingCarts } from "@/redux/features/cartSlice";
import { CURRENCY } from "@/lib/envSecret";

export default function CartPage() {
  const { carts, subtotal, totalItems } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();

  const discount = 0;
  const total = subtotal - discount;

  if (carts.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#f8fafc]">
        <div className="text-center max-w-md bg-white border border-slate-200 rounded-2xl p-8 sm:p-12">
          <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-5 border border-orange-100">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
            আপনার কার্ট বর্তমানে খালি
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            আপনার কার্টে এখনও কোনো পণ্য যোগ করা হয়নি। পছন্দের পণ্য খুঁজে এখনই শপিং শুরু করুন।
          </p>
          <Link href="/shop">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl h-11 px-8">
              কেনাকাটা শুরু করুন
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10 px-3 sm:px-4">
      <div className="container mx-auto max-w-[1276px]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
              <span>শপিং কার্ট</span>
              <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full border border-orange-200">
                {totalItems} টি পণ্য
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              পণ্যগুলো যাচাই করে চেকআউট পেজে এগিয়ে যান
            </p>
          </div>

          <Link href="/checkout">
            <Button className="bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs sm:text-sm rounded-xl h-10 sm:h-11 px-6 flex items-center gap-2">
              <span>চেকআউট করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items Column (Left 2/3) */}
          <div className="lg:col-span-2 space-y-4">
            {carts.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors hover:border-slate-300"
              >
                {/* Product Thumbnail */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0 relative">
                  {item?.productImage && (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-slate-800 line-clamp-2 hover:text-orange-600 transition-colors">
                        {item.productName}
                      </h3>

                      {item?.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.keys(item.selectedVariants).map((key) => (
                            <span
                              key={key}
                              className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md capitalize"
                            >
                              {key}: {item.selectedVariants && item.selectedVariants[key]}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-slate-400 mt-1">
                        একক মূল্য: {CURRENCY} {item.salePrice}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => dispatch(removeToCart({ productId: item?.productId, sku: item?.sku }))}
                      title="আইটেম মুছে ফেলুন"
                      className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateCartQuantity({
                              productId: item.productId,
                              sku: item.sku,
                              quantity: item.quantity - 1,
                            })
                          )
                        }
                        className="h-8 w-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-orange-600 transition-colors cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <span className="flex h-8 min-w-9 items-center justify-center border-x border-slate-200 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/50 px-2">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateCartQuantity({
                              productId: item.productId,
                              sku: item.sku,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                        className="h-8 w-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-orange-600 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-base sm:text-lg font-bold text-rose-600">
                        {CURRENCY} {item.salePrice * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>আরও কেনাকাটা করুন</span>
              </Link>

              <button
                type="button"
                onClick={() => dispatch(clearShoppingCarts())}
                className="text-xs sm:text-sm text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                সব খালি করুন
              </button>
            </div>
          </div>

          {/* Order Summary Column (Right 1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-20 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 pb-3 border-b border-slate-100">
                অর্ডার সারাংশ
              </h2>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>মোট পণ্যের মূল্য</span>
                  <span className="font-semibold text-slate-800">
                    {CURRENCY} {subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                    চেকআউটে নির্ধারিত হবে
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm sm:text-base font-bold text-slate-800">
                  সর্বমোট
                </span>
                <span className="text-xl sm:text-2xl font-bold text-rose-600">
                  {CURRENCY} {total.toLocaleString("en-IN")}
                </span>
              </div>

              <Link href="/checkout" className="block pt-2">
                <Button className="w-full h-12 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm sm:text-base rounded-xl transition-all cursor-pointer">
                  <span>চেকআউট পেজে এগিয়ে যান</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              {/* Trust Badges in Summary */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>১০০% নিরাপদ ও সুরক্ষিত পেমেন্ট</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
