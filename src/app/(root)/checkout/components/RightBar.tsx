import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/hooks/hooks";
import { CURRENCY } from "@/lib/envSecret";
import { Lock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { TMethodList } from "../page";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { TCheckoutForm } from "@/components/validations/checkout";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  deliveryCharge: number;
  selectedMethod: TMethodList | undefined;
  isLoading: boolean;
  form: UseFormReturn<TCheckoutForm>;
};

const RightBar = ({ deliveryCharge, selectedMethod, form, isLoading }: Props) => {
  const t = useTranslation();
  const { register, formState: { errors } } = form;
  const { carts, totalItems, subtotal } = useAppSelector((state) => state.cart);
  const discount = 0;
  const total = subtotal + deliveryCharge - discount;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-20 space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="font-bold text-base md:text-lg text-slate-800">
          {t["order-summary-title"] || "অর্ডার সারাংশ"}
        </h3>
        <span className="text-xs font-semibold bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full border border-orange-200">
          {totalItems} {t["item-unit"] || "টি পণ্য"}
        </span>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {carts.map((item, idx) => (
          <div key={idx} className="flex gap-3 py-2.5 border-b border-slate-100 last:border-0">
            <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden relative shrink-0">
              {item?.productImage && (
                <Image
                  src={`${item.productImage}`}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                  width={60}
                  height={60}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs md:text-sm text-slate-800 line-clamp-1 leading-snug">
                {item.productName}
              </p>
              {item?.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {Object.keys(item.selectedVariants).map((key, index, array) => (
                    <span key={key} className="capitalize">
                      {key}: {item.selectedVariants && item.selectedVariants[key]}
                      {index !== array.length - 1 && " • "}
                    </span>
                  ))}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1 font-medium">
                পরিমাণ: {item.quantity} × {CURRENCY}{item.salePrice}
              </p>
            </div>
            <div className="text-right font-bold text-xs md:text-sm text-slate-800 shrink-0">
              {CURRENCY}{(item.salePrice * item.quantity).toLocaleString("en-IN")}
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Pricing Breakdown */}
      <div className="space-y-2.5 text-xs md:text-sm">
        <div className="flex justify-between text-slate-600">
          <span>{t["subtotal-text"] || "মোট পণ্যের মূল্য"}</span>
          <span className="font-semibold text-slate-800">
            {CURRENCY} {subtotal.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>{t["delivery-charge-text"] || "ডেলিভারি চার্জ"}</span>
          {deliveryCharge === 0 ? (
            <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">
              {t["free-text"] || "ফ্রি"}
            </span>
          ) : (
            <span className="font-semibold text-slate-800">
              {CURRENCY} {deliveryCharge}
            </span>
          )}
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>{t["discount-text"] || "ডিসকাউন্ট"}</span>
            <span className="text-rose-600 font-semibold">-৳ {discount.toFixed(2)}</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between items-baseline pt-1">
          <span className="text-sm md:text-base font-bold text-slate-800">
            {t["grand-total-payable"] || "সর্বমোট প্রদেয়"}
          </span>
          <span className="text-xl md:text-2xl font-bold text-rose-600">
            {CURRENCY} {total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Manual Payment Instructions for bKash/Nagad */}
      {(selectedMethod?.value === "BKASH" || selectedMethod?.value === "NAGAD") && selectedMethod?.number && (
        <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-200/80 space-y-2">
          <p className="text-xs md:text-sm font-semibold text-slate-800">
            {selectedMethod?.label} নাম্বার:{" "}
            <span className="font-bold text-orange-600 select-all">{selectedMethod?.number}</span>
          </p>
          <p className="text-[11px] text-slate-600">
            এই নাম্বারে টাকা পাঠিয়ে নিচের ঘরে Transaction ID টি লিখে দিন:
          </p>

          <div>
            <Label className="text-xs font-medium text-slate-700">
              {selectedMethod?.label} Transaction ID *
            </Label>
            <Input
              placeholder="e.g. 9X29A8K9..."
              {...register("payment.transactionId")}
              className="mt-1 bg-white border-slate-200 text-xs"
            />
            {errors.payment?.transactionId?.message && (
              <p className="text-rose-500 text-[11px] mt-1">
                {errors.payment?.transactionId?.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Place Order CTA Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 md:h-13 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] text-white font-bold text-sm md:text-base rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <ShieldCheck className="w-5 h-5" />
        <span>
          {isLoading
            ? t["order-processing-btn"] || "অর্ডার প্রসেস হচ্ছে..."
            : t["place-order-btn"] || "অর্ডার কনফার্ম করুন"}
        </span>
      </Button>

      {/* Trust Seal */}
      <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-1">
        <Lock className="w-3.5 h-3.5 text-emerald-600" />
        <span>{t["checkout-trust-seal"] || "১০০% নিরাপদ ও এনক্রিপ্টেড চেকআউট"}</span>
      </p>
    </div>
  );
};

export default RightBar;
