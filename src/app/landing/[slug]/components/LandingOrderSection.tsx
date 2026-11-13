'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  User,
  Truck,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Minus,
  Plus,
  Sparkles,
  Lock,
  Check,
} from 'lucide-react';
import { CURRENCY } from '@/lib/envSecret';
import { IProduct, IProductVariant } from '@/redux/service/products/type';
import { ICartItem } from '@/redux/service/orders/type';
import { IAppSettings } from '@/models/app-setting';
import { useCreateOrderMutation } from '@/redux/service/orders';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { clearShoppingCarts } from '@/redux/features/cartSlice';
import { toast } from 'sonner';

interface LandingOrderSectionProps {
  product: IProduct;
  appSetting?: IAppSettings | null;
}

interface VariantSelectionState {
  [variantId: string]: {
    selected: boolean;
    quantity: number;
  };
}

export default function LandingOrderSection({
  product,
  appSetting,
}: LandingOrderSectionProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const isVariant = product.productType === 'variant' && Boolean(product.variations && product.variations.length > 0);
  const variations: IProductVariant[] = product.variations || [];

  // ---------------------------------------------------------------------------
  // VARIANT SELECTION & QUANTITIES STATE
  // ---------------------------------------------------------------------------
  // By default, the first in-stock variant is selected with quantity 1
  const [selectedVariantsMap, setSelectedVariantsMap] = useState<VariantSelectionState>(() => {
    const initial: VariantSelectionState = {};
    if (isVariant && variations.length > 0) {
      variations.forEach((v, idx) => {
        const id = v.id || v.name;
        initial[id] = {
          selected: idx === 0,
          quantity: 1,
        };
      });
    }
    return initial;
  });

  // For single product fallback (no variations)
  const [singleProductQty, setSingleProductQty] = useState(1);

  // Toggle variant checkbox
  const toggleVariantCheckbox = (variantId: string) => {
    setSelectedVariantsMap((prev) => {
      const current = prev[variantId] || { selected: false, quantity: 1 };
      return {
        ...prev,
        [variantId]: {
          selected: !current.selected,
          quantity: current.quantity > 0 ? current.quantity : 1,
        },
      };
    });
  };

  // Adjust quantity for a specific variant
  const updateVariantQty = (variantId: string, delta: number) => {
    setSelectedVariantsMap((prev) => {
      const current = prev[variantId] || { selected: false, quantity: 1 };
      const newQty = Math.max(1, current.quantity + delta);
      return {
        ...prev,
        [variantId]: {
          selected: true, // auto select when adjusting quantity
          quantity: newQty,
        },
      };
    });
  };

  // Calculate selected items list
  const selectedItems = useMemo(() => {
    if (!isVariant || variations.length === 0) {
      // Single product calculation
      const singlePrice = product.price || 0;
      const singleOfferPrice =
        product.discountPrice && product.discountPrice > 0
          ? Math.max(0, singlePrice - product.discountPrice)
          : singlePrice;

      return [
        {
          id: product.id,
          name: product.name,
          variantName: null,
          image: product.thumbnail || product.gallery?.[0] || '/images/placeholder.png',
          sku: 'N/A',
          price: singlePrice,
          offerPrice: singleOfferPrice,
          quantity: singleProductQty,
          stock: product.stock ?? 15,
          rawVariant: null as IProductVariant | null,
        },
      ];
    }

    // Variant products calculation
    const list: Array<{
      id: string;
      name: string;
      variantName: string;
      image: string;
      sku: string;
      price: number;
      offerPrice: number;
      quantity: number;
      stock: number;
      rawVariant: IProductVariant;
    }> = [];

    variations.forEach((v) => {
      const id = v.id || v.name;
      const state = selectedVariantsMap[id];
      if (state && state.selected && state.quantity > 0) {
        const vPrice = v.price || 0;
        const vOfferPrice =
          v.offerPriceFixed && v.offerPriceFixed > 0
            ? Math.max(0, vPrice - v.offerPriceFixed)
            : vPrice;

        const img =
          (v.images && v.images.length > 0 ? v.images[0] : null) ||
          product.thumbnail ||
          product.gallery?.[0] ||
          '/images/placeholder.png';

        list.push({
          id: id,
          name: product.name,
          variantName: v.name,
          image: img,
          sku: v.sku || 'N/A',
          price: vPrice,
          offerPrice: vOfferPrice,
          quantity: state.quantity,
          stock: v.stock ?? 10,
          rawVariant: v,
        });
      }
    });

    return list;
  }, [isVariant, variations, selectedVariantsMap, product, singleProductQty]);

  // ---------------------------------------------------------------------------
  // SHIPPING & TOTAL PRICING
  // ---------------------------------------------------------------------------
  const shippingZones = useMemo(() => {
    if (appSetting?.shipping?.shippingZones && appSetting.shipping.shippingZones.length > 0) {
      return appSetting.shipping.shippingZones;
    }
    return [
      { areaName: 'ঢাকার ভিতরে', fee: 60 },
      { areaName: 'ঢাকার বাহিরে', fee: 120 },
    ];
  }, [appSetting]);

  const [selectedZone, setSelectedZone] = useState<{ areaName: string; fee: number }>(() => {
    return shippingZones[0] || { areaName: 'ঢাকার ভিতরে', fee: 60 };
  });

  const isFreeShipping = Boolean(product.isFreeShipping);
  const deliveryCharge = isFreeShipping ? 0 : selectedZone.fee;

  const itemsSubtotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.offerPrice * item.quantity, 0);
  }, [selectedItems]);

  const grandTotal = itemsSubtotal + deliveryCharge;

  // ---------------------------------------------------------------------------
  // FORM FIELDS STATE
  // ---------------------------------------------------------------------------
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; address?: string }>({});

  const validate = () => {
    const newErrors: { fullName?: string; phone?: string; address?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'আপনার সম্পূর্ণ নাম লিখুন';
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'সঠিক মোবাইল নম্বর লিখুন';
    } else if (cleanPhone.length < 11) {
      newErrors.phone = 'মোবাইল নম্বরটি কমপক্ষে ১১ ডিজিটের হতে হবে';
    }

    if (!address.trim()) {
      newErrors.address = 'আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন (যেমন: রোড, বাড়ি, থানা, জেলা)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      toast.error('অনুগ্রহ করে অন্তত একটি ভ্যারিয়েন্ট সিলেক্ট করুন');
      return;
    }

    if (!validate()) {
      toast.error('অনুগ্রহ করে প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন');
      return;
    }

    // Build cart items array for createOrder
    const cartItems: ICartItem[] = selectedItems.map((item) => {
      const selectedVariantsObj: Record<string, string> = {};
      if (item.variantName) {
        selectedVariantsObj['Option'] = item.variantName;
      }

      return {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        sku: item.sku || 'N/A',
        quantity: item.quantity,
        price: item.price,
        salePrice: item.offerPrice,
        productType: product.productType,
        productImage: item.image,
        selectedVariants: Object.keys(selectedVariantsObj).length > 0 ? selectedVariantsObj : undefined,
        variationId: item.rawVariant?.id || null,
        freeShipping: isFreeShipping,
      };
    });

    const payload = {
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        postalCode: null,
      },
      payment: {
        method: 'COD' as const,
        status: 'PENDING' as const,
      },
      deliveryCharge: deliveryCharge,
      customerNote: customerNote.trim() || undefined,
      items: cartItems,
      userId: user?.id || null,
      pricing: {
        shippingCharge: deliveryCharge,
      },
    };

    try {
      const res = await createOrder(payload).unwrap();
      toast.success('আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!');
      dispatch(clearShoppingCarts());

      if (res?.data?.trackingNumber) {
        router.push(`/order/success?oid=${res.data.trackingNumber}`);
      } else {
        router.push('/order/success');
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন বা সরাসরি কল করুন।');
    }
  };

  return (
    <section
      id="order-section"
      className="py-14 sm:py-20 bg-gradient-to-b from-orange-50/50 via-white to-slate-50 border-t-2 border-brand/20 scroll-mt-20"
    >
      {/* Anchor identifier */}
      <span id="order-form" className="block -mt-24 pt-24 invisible" />

      <div className="container mx-auto max-w-[1140px] px-4">
        {/* Main Card Container */}
        <div className="bg-white rounded-3xl sm:rounded-4xl border-2 border-orange-300 shadow-2xl shadow-orange-500/10 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-brand via-orange-600 to-amber-600 text-white p-6 sm:p-8 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>সহজে অর্ডার করুন</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              পছন্দের ভ্যারিয়েন্ট ও পরিমাণ সিলেক্ট করে অর্ডার করুন
            </h2>

            <p className="text-xs sm:text-sm text-orange-100 max-w-xl mx-auto font-medium">
              ক্যাশ অন ডেলিভারিতে কোনো অগ্রিম টাকা নেই। পণ্য হাতে পেয়ে সম্পূর্ণ দেখে মূল্য পরিশোধ করবেন।
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
            {/* --------------------------------------------------------- */}
            {/* 1. VARIANT SELECTION CARDS (GRID OF CARDS WITH CHECKBOX)  */}
            {/* --------------------------------------------------------- */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-light text-brand flex items-center justify-center font-bold text-xs">
                    ১
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {isVariant ? 'ভ্যারিয়েন্ট বেছে নিন (টিক চিহ্ন দিন ও পরিমাণ নির্ধারণ করুন):' : 'পণ্য ও পরিমাণ:'}
                  </h3>
                </div>

                <span className="text-xs font-semibold text-slate-500">
                  {selectedItems.length} টি ভ্যারিয়েন্ট সিলেক্টেড
                </span>
              </div>

              {/* Grid of Variant Cards */}
              {isVariant ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {variations.map((v, idx) => {
                    const id = v.id || v.name;
                    const state = selectedVariantsMap[id] || { selected: false, quantity: 1 };
                    const isChecked = state.selected;
                    const vPrice = v.price || 0;
                    const vOffer =
                      v.offerPriceFixed && v.offerPriceFixed > 0
                        ? Math.max(0, vPrice - v.offerPriceFixed)
                        : vPrice;

                    const vImg =
                      (v.images && v.images.length > 0 ? v.images[0] : null) ||
                      product.thumbnail ||
                      product.gallery?.[0] ||
                      '/images/placeholder.png';

                    return (
                      <div
                        key={id}
                        className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                          isChecked
                            ? 'border-brand bg-brand-light/30 shadow-md ring-2 ring-brand/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                        onClick={() => toggleVariantCheckbox(id)}
                      >
                        {/* Top Row: Checkbox + Thumbnail + Variant Name + Price */}
                        <div className="flex items-start gap-3">
                          {/* Stylized Checkbox */}
                          <div
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                              isChecked
                                ? 'bg-brand border-brand text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>

                          {/* Variant Thumbnail */}
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                            <Image
                              src={vImg}
                              alt={v.name}
                              fill
                              className="object-contain p-1"
                            />
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono font-bold text-slate-400">
                                #{idx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                {v.name}
                              </h4>
                            </div>

                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                              {(v.stock ?? 0) > 0 ? (
                                <span className="text-emerald-600 font-semibold">স্টকে আছে</span>
                              ) : (
                                <span className="text-rose-500 font-semibold">স্টক শেষ</span>
                              )}
                              {v.sku && ` • SKU: ${v.sku}`}
                            </p>

                            {/* Price */}
                            <div className="flex items-baseline gap-2 pt-1">
                              <span className="text-sm sm:text-base font-black text-slate-900">
                                {CURRENCY} {vOffer.toLocaleString()}
                              </span>
                              {vPrice > vOffer && (
                                <del className="text-xs text-slate-400">
                                  {CURRENCY} {vPrice.toLocaleString()}
                                </del>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Quantity Increment / Decrement Controller */}
                        <div
                          className="flex items-center justify-between pt-2 border-t border-slate-100"
                          onClick={(e) => e.stopPropagation()} // Prevent card toggle when clicking buttons
                        >
                          <span className="text-xs font-semibold text-slate-600">
                            পরিমাণ:
                          </span>

                          <div className="inline-flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateVariantQty(id, -1)}
                              disabled={state.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="w-10 text-center text-xs sm:text-sm font-black text-slate-900">
                              {state.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => updateVariantQty(id, 1)}
                              disabled={state.quantity >= (v.stock ?? 99)}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-slate-900">
                            মোট: {CURRENCY} {(vOffer * state.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Single product card */
                <div className="p-4 sm:p-5 rounded-2xl border-2 border-brand bg-brand-light/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                      <Image
                        src={product.thumbnail || product.gallery?.[0] || '/images/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {product.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        একক প্রিমিয়াম প্যাক • ১০০% আসল
                      </p>
                      <p className="text-sm font-black text-slate-900 pt-0.5">
                        {CURRENCY} {itemsSubtotal.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-700">পরিমাণ:</span>
                    <div className="inline-flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setSingleProductQty(Math.max(1, singleProductQty - 1))}
                        disabled={singleProductQty <= 1}
                        className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-black text-slate-900">
                        {singleProductQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSingleProductQty(singleProductQty + 1)}
                        className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* --------------------------------------------------------- */}
            {/* 2. CUSTOMER DELIVERY FORM & LIVE SUMMARY                  */}
            {/* --------------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
              {/* Left Column: Customer Delivery Form (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-brand-light text-brand flex items-center justify-center font-bold text-xs">
                    ২
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    আপনার ডেলিভারি তথ্য দিন:
                  </h3>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-800">
                    আপনার সম্পূর্ণ নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                    }}
                    placeholder="যেমন: মোঃ রহিম উদ্দিন"
                    className={`w-full h-12 px-4 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                      errors.fullName
                        ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400'
                        : 'border-slate-300 focus:border-brand focus:ring-brand/30 bg-white'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between">
                    <span>মোবাইল নম্বর (১১ ডিজিট) <span className="text-rose-500">*</span></span>
                    <span className="text-[11px] font-normal text-slate-500">যে নম্বরে যোগাযোগ করবেন</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="যেমন: 01712345678"
                    className={`w-full h-12 px-4 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                      errors.phone
                        ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400'
                        : 'border-slate-300 focus:border-brand focus:ring-brand/30 bg-white'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Full Address */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between">
                    <span>সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-500">*</span></span>
                    <span className="text-[11px] font-normal text-slate-500">রোড, বাড়ি, থানা ও জেলা</span>
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                    }}
                    placeholder="যেমন: বাড়ি নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা"
                    className={`w-full p-3.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 resize-none ${
                      errors.address
                        ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400'
                        : 'border-slate-300 focus:border-brand focus:ring-brand/30 bg-white'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.address}</span>
                    </p>
                  )}
                </div>

                {/* Delivery Zone Radio Selector */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-brand" />
                    <span>ডেলিভারি এরিয়া বেছে নিন:</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {shippingZones.map((zone, idx) => {
                      const isSelected = selectedZone.areaName === zone.areaName;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedZone(zone)}
                          className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-brand bg-brand-light ring-2 ring-brand/30 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-brand bg-brand' : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-800">
                              {zone.areaName}
                            </span>
                          </div>

                          <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                            {isFreeShipping || zone.fee === 0 ? (
                              <span className="text-emerald-600 font-bold">ফ্রি</span>
                            ) : (
                              `${CURRENCY} ${zone.fee}`
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Customer Note */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-slate-600">
                    কোনো বিশেষ নির্দেশনা থাকলে লিখুন (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="যেমন: বিকেলে ডেলিভারি দিলে ভালো হয়"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-brand focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Right Column: Live Order Summary & Confirm Button (5 cols) */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand flex items-center justify-center font-bold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    অর্ডার সামারি
                  </h3>
                </div>

                {/* List of Chosen Items */}
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {selectedItems.length > 0 ? (
                    selectedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 truncate">
                            {item.variantName ? `${item.variantName}` : item.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            পরিমাণ: {item.quantity} টি × {CURRENCY} {item.offerPrice.toLocaleString()}
                          </p>
                        </div>
                        <span className="font-black text-slate-900 shrink-0">
                          {CURRENCY} {(item.offerPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold text-center border border-amber-200">
                      কোনো ভ্যারিয়েন্ট সিলেক্ট করা হয়নি। উপরের তালিকা থেকে পছন্দমতো টিক চিহ্ন দিন।
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-2 text-xs sm:text-sm border-t border-slate-200">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>আইটেম সাবটোটাল:</span>
                    <span className="font-bold text-slate-900">
                      {CURRENCY} {itemsSubtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>ডেলিভারি চার্জ ({selectedZone.areaName}):</span>
                    <span className="font-bold text-slate-900">
                      {deliveryCharge === 0 ? (
                        <span className="text-emerald-600 font-bold">ফ্রি</span>
                      ) : (
                        `${CURRENCY} ${deliveryCharge}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                    <span>সর্বমোট বিল:</span>
                    <span className="text-xl sm:text-2xl font-black text-brand">
                      {CURRENCY} {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Payment Mode Note */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <p className="font-bold">পেমেন্ট মেথড: ক্যাশ অন ডেলিভারি (COD)</p>
                    <p className="text-[11px] text-amber-800">পণ্য হাতে পাওয়ার পর দেখে মূল্য পরিশোধ করবেন।</p>
                  </div>
                </div>

                {/* BIG PROMINENT ORDER BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading || selectedItems.length === 0}
                  className="w-full h-14 sm:h-16 rounded-2xl font-black text-base sm:text-lg text-white bg-gradient-to-r from-brand via-orange-600 to-amber-600 hover:brightness-105 active:scale-98 transition-all shadow-xl shadow-brand/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>অর্ডার প্রসেস হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-white/80" />
                      <span>অর্ডার কনফার্ম করুন • {CURRENCY} {grandTotal.toLocaleString()}</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-500 text-center font-medium">
                  🔒 আপনার তথ্য সম্পূর্ণ সুরক্ষিত। কোনো সমস্যা থাকলে ডেলিভারি ম্যানের সামনেই চেক করতে পারবেন।
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
