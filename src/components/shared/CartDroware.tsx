"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";

import {
  removeToCart,
  toggleCartDroware,
  updateCartQuantity,
} from "@/redux/features/cartSlice";

import { CURRENCY } from "@/lib/envSecret";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

const EcommerceCartDrawer = () => {
  const t = useTranslation();
  const { open, carts, subtotal, totalItems } = useAppSelector(
    (state) => state.cart
  );

  const dispatch = useAppDispatch();

  const handleToggleCart = () => {
    dispatch(toggleCartDroware());
  };

  return (
    <Drawer
      open={open}
      onOpenChange={handleToggleCart}
      direction="right"
    >
      <DrawerContent className="
        fixed inset-y-0 right-0 z-50
        w-screen! max-w-none!
        sm:w-110! md:w-120!
        h-full flex flex-col
        bg-white border-l border-slate-200
        rounded-none md:rounded-l-2xl outline-hidden
      ">
        {/* Drawer Header */}
        <DrawerHeader className="border-b border-slate-100 px-5 py-4 bg-white shrink-0">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2.5 text-base md:text-lg font-bold text-slate-800">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span>{t["cart-title"] || "শপিং কার্ট"}</span>
              <span className="text-xs font-semibold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">
                {totalItems} {t["cart-item-count"] || "টি পণ্য"}
              </span>
            </DrawerTitle>

            <button
              type="button"
              onClick={handleToggleCart}
              aria-label="Close Cart Drawer"
              className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DrawerHeader>

        {/* Free Shipping / Cash on delivery Banner */}
        {carts.length > 0 && (
          <div className="bg-orange-50/70 border-b border-orange-100/80 px-5 py-2.5 flex items-center gap-2 text-xs font-medium text-orange-800 shrink-0">
            <Truck className="w-4 h-4 text-orange-600 shrink-0" />
            <span>{t["delivery-guarantee"] || "সারাদেশে দ্রুত ক্যাশ অন হোম ডেলিভারি সুবিধা রয়েছে"}</span>
          </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3 bg-slate-50/50">
          {carts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-20 h-20 rounded-full bg-orange-100/70 text-orange-500 flex items-center justify-center mb-4 border border-orange-200">
                <ShoppingBag className="w-9 h-9" />
              </div>

              <h3 className="text-lg md:text-xl font-bold text-slate-800">
                {t["cart-empty-title"] || "আপনার কার্ট খালি রয়েছে"}
              </h3>

              <p className="mt-1.5 max-w-xs text-xs md:text-sm text-slate-500 leading-relaxed">
                {t["cart-empty-desc"] || "পছন্দের পণ্যগুলো কার্টে যোগ করে সহজেই অর্ডার সম্পন্ন করুন।"}
              </p>

              <Link href="/shop" onClick={handleToggleCart} className="mt-6">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs md:text-sm h-10 px-6 rounded-xl">
                  {t["start-shopping"] || "কেনাকাটা শুরু করুন"}
                </Button>
              </Link>
            </div>
          ) : (
            carts.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-3 bg-white p-3 rounded-xl border border-slate-200 hover:border-orange-300 transition-all"
              >
                {/* Product Image */}
                <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  {/* Top: Name & Remove */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="line-clamp-2 text-xs md:text-sm font-semibold text-slate-800 leading-snug hover:text-orange-600 transition-colors">
                        {item.productName}
                      </h4>

                      {item?.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.keys(item.selectedVariants).map((key) => (
                            <span
                              key={key}
                              className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded capitalize"
                            >
                              {key}: {item.selectedVariants && item.selectedVariants[key]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          removeToCart({
                            productId: item.productId,
                            sku: item.sku,
                            variationId: item.variationId,
                          })
                        )
                      }
                      title="আইটেম মুছে ফেলুন"
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Bottom: Price & Quantity Controls */}
                  <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-sm md:text-base font-bold text-rose-600">
                        {CURRENCY} {item.salePrice * item.quantity}
                      </span>
                      {item.quantity > 1 && (
                        <span className="block text-[10px] text-slate-400">
                          {CURRENCY} {item.salePrice} × {item.quantity}
                        </span>
                      )}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateCartQuantity({
                              productId: item.productId,
                              sku: item.sku,
                              variationId: item.variationId,
                              quantity: item.quantity - 1,
                            })
                          )
                        }
                        className="h-7 w-7 flex items-center justify-center text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>

                      <span className="flex h-7 min-w-7 items-center justify-center border-x border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/50 px-1.5">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateCartQuantity({
                              productId: item.productId,
                              sku: item.sku,
                              variationId: item.variationId,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                        className="h-7 w-7 flex items-center justify-center text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Button */}
        {carts.length > 0 && (
          <div className="border-t border-slate-200 bg-white p-4 md:p-5 shrink-0">
            <div className="space-y-3">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-xs md:text-sm text-slate-600">
                <span>{t["subtotal-text"] || "মোট পণ্যের মূল্য"}:</span>
                <span className="font-semibold text-slate-800">
                  {CURRENCY} {subtotal}
                </span>
              </div>

              {/* Shipping info */}
              <div className="flex items-center justify-between text-xs md:text-sm text-slate-600">
                <span>{t["delivery-charge-text"] || "ডেলিভারি চার্জ"}:</span>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  {t["delivery-charge-note"] || "চেকআউট পেজে নির্ধারণ হবে"}
                </span>
              </div>

              <Separator />

              {/* Grand Total */}
              <div className="flex items-center justify-between">
                <span className="text-sm md:text-base font-bold text-slate-800">
                  {t["grand-total-text"] || "সর্বমোট"}:
                </span>
                <span className="text-lg md:text-xl font-bold text-rose-600">
                  {CURRENCY} {subtotal}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {/* Proceed to Checkout Button */}
                <Link
                  href="/checkout"
                  onClick={handleToggleCart}
                  className="w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] text-white font-bold h-11 md:h-12 rounded-xl flex items-center justify-center gap-2 text-xs md:text-sm cursor-pointer"
                >
                  <span>{t["proceed-to-checkout"] || "অর্ডার কনফার্ম করতে এগিয়ে যান"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* View Cart Page Button */}
                <Link
                  href="/cart"
                  onClick={handleToggleCart}
                  className="w-full border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 text-slate-700 font-medium h-9 md:h-10 rounded-xl flex items-center justify-center text-xs md:text-sm transition-colors"
                >
                  {t["view-cart-btn"] || "কার্ট পেজ দেখুন"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default EcommerceCartDrawer;
