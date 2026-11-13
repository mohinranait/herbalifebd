"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, MapPin, CheckCircle2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { CURRENCY } from "@/lib/envSecret";
import PersistReady from "@/providers/PersistReady";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, TCheckoutForm } from "@/components/validations/checkout";
import { useCreateOrderMutation } from "@/redux/service/orders";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useGetAppSettingQuery } from "@/redux/service/setting";
import RightBar from "./components/RightBar";
import PaymentMethod from "./components/PaymentMethod";
import { TPaymentMethod } from "@/redux/service/orders/type";
import { clearShoppingCarts } from "@/redux/features/cartSlice";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type TPaymentMethodType = {
  cod: boolean;
  bKash: {
    enabled: boolean;
    merchantNumber?: string;
  };
  nagad: {
    enabled: boolean;
    merchantNumber?: string;
  };
};

export type TMethodList = {
  value: TPaymentMethod;
  label: string;
  icon: string | null;
  number?: string | null;
};

// The cart lives in localStorage: wait for it instead of flashing "nothing to check out"
export default function CheckoutPage() {
  return (
    <PersistReady fallback={<div className="min-h-[70vh] bg-[#f8fafc]" />}>
      <CheckoutPageContent />
    </PersistReady>
  );
}

function CheckoutPageContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { data: appSetting } = useGetAppSettingQuery();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { carts } = useAppSelector((state) => state.cart);
  const [zone, setZone] = useState<{
    areaName: string;
    fee: number;
  } | null>(null);

  const isShippingProduct = carts?.some((item) => item.freeShipping === false);

  const paymentMethodss = useMemo(() => {
    const methods = appSetting?.paymentMethods as TPaymentMethodType;
    const list: TMethodList[] = [];

    if (methods?.cod) {
      list.push({
        value: "COD",
        label: "ক্যাশ অন ডেলিভারি",
        icon: "cod.png",
      });
    }
    if (methods?.bKash?.enabled) {
      list.push({
        value: "BKASH",
        label: "বিকাশ (bKash)",
        icon: "bkash.png",
        number: methods.bKash.merchantNumber || "017XXXXXXXX",
      });
    }
    if (methods?.nagad?.enabled) {
      list.push({
        value: "NAGAD",
        label: "নগদ (Nagad)",
        icon: "Nagad-png.png",
        number: methods.nagad.merchantNumber || "019XXXXXXXX",
      });
    }

    return list;
  }, [appSetting?.paymentMethods]);

  let deliveryCharge = 0;
  if (isShippingProduct) {
    deliveryCharge = zone ? zone?.fee : 0;
  }

  const zones = useMemo(() => {
    return appSetting?.shipping?.shippingZones || [];
  }, [appSetting?.shipping?.shippingZones]);

  const form = useForm<TCheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      payment: {
        method: "COD",
        status: "PENDING",
      },
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const paymentMethod = watch("payment.method");

  const onSubmit = async (data: TCheckoutForm) => {
    if (!carts || carts.length === 0) {
      toast.warning("আপনার কার্ট খালি রয়েছে");
      return;
    }
    const payload = {
      ...data,
      userId: user?._id || null,
      items: carts,
      pricing: {
        shippingCharge: deliveryCharge,
      },
    };

    try {
      const { data: resData } = await createOrder(payload).unwrap();
      toast.success("অর্ডার সফলভাবে সম্পন্ন হয়েছে!");
      dispatch(clearShoppingCarts());
      router.push(`/order/success?oid=${resData?.trackingNumber}`);
    } catch (error) {
      console.log(error);
      handleErrors(error as ErrorResponse);
    }
  };

  useEffect(() => {
    if (zones.length > 0 && !zone) {
      setZone(zones[0]);
    }
  }, [zones, zone]);

  const selectedMethod = useMemo(() => {
    if (!paymentMethod) return;
    return paymentMethodss?.find((item) => item.value === paymentMethod);
  }, [paymentMethod, paymentMethodss]);

  if (!carts || carts.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#f8fafc]">
        <div className="text-center max-w-md bg-white border border-slate-200 rounded-2xl p-8 sm:p-12">
          <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-5 border border-orange-100">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
            চেকআউট করার জন্য কোনো পণ্য নেই
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            আপনার কার্ট খালি। পছন্দের পণ্য নির্বাচন করে কার্টে যোগ করুন।
          </p>
          <Link href="/shop">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl h-11 px-8">
              কেনাকাটা করুন
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10 px-3 sm:px-4">
      <div className="container mx-auto max-w-[1276px]">
        {/* Page Title */}
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 md:w-7 md:h-7 text-orange-500" />
            <span>চেকআউট ও অর্ডার কনফার্মেশন</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            সঠিক নাম, ঠিকানা ও মোবাইল নাম্বার দিয়ে অর্ডারটি কনফার্ম করুন
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Side: Delivery Information & Payment (3 Cols) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Delivery Information Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h2 className="text-base md:text-lg font-bold text-slate-800">
                    ডেলিভারি তথ্য
                  </h2>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">
                      আপনার নাম <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      {...register("shippingAddress.fullName")}
                      placeholder="e.g. মোঃ রহিম"
                      className="mt-1.5 h-10 border-slate-200 text-sm focus-visible:ring-orange-500"
                    />
                    {errors.shippingAddress?.fullName?.message && (
                      <p className="text-rose-500 text-xs mt-1">
                        {errors.shippingAddress?.fullName?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">
                      মোবাইল নাম্বার <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      {...register("shippingAddress.phone")}
                      type="tel"
                      placeholder="e.g. 017XXXXXXXX"
                      className="mt-1.5 h-10 border-slate-200 text-sm focus-visible:ring-orange-500"
                    />
                    {errors.shippingAddress?.phone?.message && (
                      <p className="text-rose-500 text-xs mt-1">
                        {errors.shippingAddress?.phone?.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Delivery Zone */}
                {isShippingProduct ? (
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-2.5 block">
                      ডেলিভারি এরিয়া বেছে নিন <span className="text-rose-500">*</span>
                    </Label>
                    <RadioGroup
                      value={zone?.areaName}
                      onValueChange={(v) => {
                        const findZone = zones?.find((ite) => ite.areaName === v);
                        setZone(findZone || null);
                      }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      {zones?.map((zon, index) => {
                        const isSelected = zone?.areaName === zon.areaName;
                        return (
                          <div
                            key={index}
                            onClick={() => setZone(zon)}
                            className={`border rounded-xl p-3.5 cursor-pointer transition-all ${
                              isSelected
                                ? "border-2 border-orange-500 bg-orange-50/40 text-slate-900"
                                : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem
                                value={zon.areaName}
                                id={`zone-${index}`}
                              />
                              <Label
                                htmlFor={`zone-${index}`}
                                className="flex flex-col cursor-pointer items-start flex-1"
                              >
                                <span className="font-semibold text-xs md:text-sm text-left">
                                  {zon.areaName}
                                </span>
                                <span className="text-xs font-bold text-orange-600 mt-0.5">
                                  ডেলিভারি চার্জ: {CURRENCY}{zon.fee}
                                </span>
                              </Label>
                            </div>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>এই অর্ডারে সম্পূর্ণ ফ্রি ডেলিভারি পাচ্ছেন!</span>
                  </div>
                )}

                {/* Address */}
                <div>
                  <Label className="text-xs font-semibold text-slate-700">
                    সম্পূর্ণ ঠিকানা <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    {...register("shippingAddress.address")}
                    placeholder="বাড়ি নম্বর, রোড নম্বর, এলাকা, থানা, জেলা..."
                    className="mt-1.5 min-h-20 border-slate-200 text-sm focus-visible:ring-orange-500"
                  />
                  {errors.shippingAddress?.address?.message && (
                    <p className="text-rose-500 text-xs mt-1">
                      {errors.shippingAddress?.address?.message}
                    </p>
                  )}
                </div>

                {/* Customer Note */}
                <div>
                  <Label className="text-xs font-semibold text-slate-700">
                    অর্ডার নোট (ঐচ্ছিক)
                  </Label>
                  <Textarea
                    {...register("customerNote")}
                    placeholder="ডেলিভারি সংক্রান্ত কোনো নির্দেশনা থাকলে লিখতে পারেন..."
                    className="mt-1.5 min-h-16 border-slate-200 text-sm focus-visible:ring-orange-500"
                  />
                </div>
              </div>

              {/* Payment Method Card */}
              <PaymentMethod
                paymentMethod={paymentMethod}
                paymentMethodss={paymentMethodss}
                callBack={(value) => setValue("payment.method", value as "COD" | "BKASH")}
              />
            </div>

            {/* Right Side: Order Summary (2 Cols) */}
            <div className="lg:col-span-2">
              <RightBar
                deliveryCharge={deliveryCharge}
                selectedMethod={selectedMethod}
                form={form}
                isLoading={isLoading}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
