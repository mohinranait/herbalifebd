'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
  ArrowRight,
  Phone,
  MessageCircle,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  Check,
  Package,
} from 'lucide-react';
import { CURRENCY } from '@/lib/envSecret';
import { IProduct } from '@/redux/service/products/type';
import { IAppSettings } from '@/models/app-setting';
import { toast } from 'sonner';

interface LandingHeroProps {
  product: IProduct;
  appSetting?: IAppSettings | null;
  onScrollToOrder: () => void;
  offerPrice: number;
  regularPrice: number;
  discountPercent: number;
}

export default function LandingHero({
  product,
  appSetting,
  onScrollToOrder,
  offerPrice,
  regularPrice,
  discountPercent,
}: LandingHeroProps) {
  // Gallery images array
  const images = React.useMemo(() => {
    const list: string[] = [];
    if (product.thumbnail) list.push(product.thumbnail);
    if (product.gallery && product.gallery.length > 0) {
      product.gallery.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ['/images/placeholder.png'];
  }, [product]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const phone = appSetting?.contactPhone || '01602094399';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/88${cleanPhone.startsWith('88') ? cleanPhone.slice(2) : cleanPhone}?text=${encodeURIComponent(
    `হ্যালো! আমি "${product.name}" সম্পর্কে জানতে এবং অর্ডার করতে চাই।`
  )}`;

  const stock = product.stock ?? 15;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('লিংক কপি করা হয়েছে!');
    }
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pb-16 bg-gradient-to-b from-orange-50/40 via-white to-slate-50/60">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-br from-brand/10 via-amber-200/20 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto max-w-[1240px] px-4">
        {/* Breadcrumb Tag & Share */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-light text-brand border border-brand-border">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{product.brand?.name || 'অরিজিনাল প্রিমিয়াম কালেকশন'}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>১০০% জেনুইন অথেনটিক</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>শেয়ার করুন</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* HERO GRID: 2 COLUMNS                                          */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ----------------------------------------------------------- */}
          {/* LEFT: PRODUCT IMAGE GALLERY                                 */}
          {/* ----------------------------------------------------------- */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-28">
            {/* Main Stage Image */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-lg shadow-slate-200/50 group">
              <Image
                src={images[activeImageIdx] || '/images/placeholder.png'}
                alt={product.name}
                fill
                priority
                className="object-contain p-4 sm:p-6 transition-transform duration-500 group-hover:scale-105"
              />

              {/* Discount Tag Top-Left */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-full shadow-md shadow-rose-500/30 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{Math.round(discountPercent)}% ছাড়</span>
                </div>
              )}

              {/* Stock Indicator Top-Right */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-amber-700 border border-amber-200 shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  {stock > 10 ? 'স্টকে পর্যাপ্ত আছে' : `মাত্র ${stock} টি বাকি আছে!`}
                </span>
              </div>

              {/* Free Delivery Ribbon if applicable */}
              {product.isFreeShipping && (
                <div className="absolute bottom-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>সারা দেশে ফ্রি ডেলিভারি</span>
                </div>
              )}
            </div>

            {/* Thumbnail switcher */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIdx === idx
                        ? 'border-brand ring-2 ring-brand/30 shadow-md scale-102 bg-white'
                        : 'border-slate-200 bg-white/80 opacity-70 hover:opacity-100 hover:border-slate-300'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-contain p-1.5"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------- */}
          {/* RIGHT: INFORMATIVE SHOWCASE (NO VARIANT SELECTOR HERE)       */}
          {/* ----------------------------------------------------------- */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title & Short Description */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {product.shortDescription && (
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  {product.shortDescription}
                </p>
              )}

              {/* Ratings and review badge */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 pt-1">
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-extrabold text-slate-800 ml-1">
                    {product.ratingsAverage ? product.ratingsAverage.toFixed(1) : '4.9'}
                  </span>
                  <span className="text-slate-400">/ 5.0</span>
                </div>

                <span className="font-semibold text-slate-700">
                  ({product.totalReviews || 128} টি ভেরিফাইড রিভিউ)
                </span>

                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>৯৮% গ্রাহক সন্তুষ্ট</span>
                </span>
              </div>
            </div>

            {/* --------------------------------------------------------- */}
            {/* PRICE CARD BOX                                            */}
            {/* --------------------------------------------------------- */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border-2 border-orange-200/80 shadow-md shadow-orange-500/5 space-y-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {CURRENCY} {offerPrice.toLocaleString()}
                </span>

                {regularPrice > offerPrice && (
                  <del className="text-lg sm:text-xl text-slate-400 font-semibold">
                    {CURRENCY} {regularPrice.toLocaleString()}
                  </del>
                )}

                {discountPercent > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white tracking-wide">
                    সাশ্রয়: {CURRENCY} {(regularPrice - offerPrice).toLocaleString()} (
                    {Math.round(discountPercent)}% ছাড়)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 pt-1 border-t border-orange-200/60">
                <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                <span>আজকের এই বিশেষ মূল্য ও স্টক অফার সীমিত সময়ের জন্য প্রযোজ্য!</span>
              </div>
            </div>

            {/* --------------------------------------------------------- */}
            {/* PRODUCT HIGHLIGHT BULLETS (INFORMATIVE SYSTEM)            */}
            {/* --------------------------------------------------------- */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand" />
                <span>প্রোডাক্টের মূল বৈশিষ্ট্যসমূহ:</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-100">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">১০০% আসল ও ইনট্যাক্ট প্রোডাক্ট</span>
                </div>
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-100">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">আন্তর্জাতিক প্রিমিয়াম মান নিশ্চিত</span>
                </div>
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-100">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">ক্যাশ অন ডেলিভারিতে চেক করে পেমেন্ট</span>
                </div>
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-100">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি</span>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------- */}
            {/* CALL TO ACTION BUTTONS (Smooth scroll to order section)   */}
            {/* --------------------------------------------------------- */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={onScrollToOrder}
                className="w-full h-14 sm:h-16 rounded-2xl font-black text-base sm:text-lg text-white bg-gradient-to-r from-brand via-orange-500 to-amber-500 hover:brightness-105 transition-all shadow-xl shadow-brand/30 flex items-center justify-center gap-3 cursor-pointer group active:scale-98 animate-pulse hover:animate-none"
              >
                <span>অর্ডার করতে এখানে ক্লিক করুন</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl font-bold text-xs sm:text-sm text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp এ কথা বলুন</span>
                </a>

                <a
                  href={`tel:${phone}`}
                  className="w-full h-12 rounded-xl font-bold text-xs sm:text-sm text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span>কল করুন: {phone}</span>
                </a>
              </div>
            </div>

            {/* --------------------------------------------------------- */}
            {/* 4 PILLARS OF TRUST / VALUE PROPOSITIONS                   */}
            {/* --------------------------------------------------------- */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-brand mx-auto flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">দ্রুত ডেলিভারি</p>
                <p className="text-[10px] text-slate-500">১-৩ কার্যদিবসে</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">ক্যাশ অন ডেলিভারি</p>
                <p className="text-[10px] text-slate-500">হাতে পেয়ে পরিশোধ</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">সহজ রিটার্ন</p>
                <p className="text-[10px] text-slate-500">৭ দিনের মধ্যে</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">১০০% আসল</p>
                <p className="text-[10px] text-slate-500">অথেনটিক পণ্য</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
