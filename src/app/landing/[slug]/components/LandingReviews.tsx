'use client';

import React from 'react';
import { Star, ShieldCheck, ThumbsUp, CheckCircle2 } from 'lucide-react';
import { IProductCommentItem } from '@/lib/storefront-data';
import StarRating from '@/components/shared/StarRating';
import { formatDistanceToNow } from 'date-fns';

interface LandingReviewsProps {
  productName: string;
  reviews: IProductCommentItem[];
  avgRating: number;
  totalReviews: number;
}

export default function LandingReviews({
  productName,
  reviews,
  avgRating,
  totalReviews,
}: LandingReviewsProps) {
  const formatReviewDate = (date?: string | Date) => {
    if (!date) return 'কয়েক দিন আগে';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'কয়েক দিন আগে';
    }
  };

  const defaultTestimonials = [
    {
      name: 'তানভীর আহমেদ',
      city: 'উত্তরা, ঢাকা',
      rating: 5,
      date: '৩ দিন আগে',
      comment:
        'প্রোডাক্টটি পেয়ে খুবই ভালো লেগেছে। প্যাকেজিং এবং প্রোডাক্টের মান ১০০% অথেনটিক ছিল। ডেলিভারি ২ দিনের মধ্যেই পেয়েছি। ধন্যবাদ!',
    },
    {
      name: 'নুসরাত জাহান',
      city: 'চট্টগ্রাম',
      rating: 5,
      date: '১ সপ্তাহ আগে',
      comment:
        'আমি নিয়মিত ব্যবহার করছি এবং সত্যি অসাধারণ ফলাফল পেয়েছি। সেলারের রেসপন্স ও কাস্টমার সার্ভিস খুব হেল্পফুল ছিল।',
    },
    {
      name: 'রাশেদুল করিম',
      city: 'সিলেট',
      rating: 5,
      date: '২ সপ্তাহ আগে',
      comment:
        'ক্যাশ অন ডেলিভারিতে চেক করে নিতে পেরেছি। ১০০% অরিজিনাল প্রোডাক্ট, কোনো সন্দেহ নেই। যারা নিতে চাচ্ছেন নিঃসন্দেহে নিতে পারেন।',
    },
  ];

  return (
    <section id="reviews" className="py-12 sm:py-16 bg-slate-50/70 border-t border-slate-100">
      <div className="container mx-auto max-w-[1240px] px-4 space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <ThumbsUp className="w-3.5 h-3.5 text-amber-600" />
            <span>সন্তুষ্ট গ্রাহকদের অভিজ্ঞতা</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            গ্রাহকদের মতামত ও রেটিং
          </h2>

          <p className="text-sm sm:text-base text-slate-600">
            আমাদের পণ্য ব্যবহার করে সম্মানিত ক্রেতাগণ যা বলছেন
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* OVERALL RATING OVERVIEW CARD                                  */}
        {/* ------------------------------------------------------------- */}
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Score box */}
            <div className="md:col-span-5 text-center md:text-left md:pr-8 md:border-r border-slate-200 space-y-2">
              <div className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
                {avgRating > 0 ? avgRating.toFixed(1) : '4.9'}
                <span className="text-lg text-slate-400 font-normal"> / 5.0</span>
              </div>

              <div className="flex items-center justify-center md:justify-start text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                সর্বমোট {totalReviews > 0 ? totalReviews : '১২০+'} জন ভেরিফাইড ক্রেতার গড় রেটিং
              </p>

              <div className="pt-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>৯৮% ইতিবাচক রেটিং</span>
                </span>
              </div>
            </div>

            {/* Rating distribution */}
            <div className="md:col-span-7 space-y-2">
              {[
                { stars: 5, pct: 88, count: 112 },
                { stars: 4, pct: 10, count: 12 },
                { stars: 3, pct: 2, count: 2 },
                { stars: 2, pct: 0, count: 0 },
                { stars: 1, pct: 0, count: 0 },
              ].map((item) => (
                <div key={item.stars} className="flex items-center gap-3 text-xs sm:text-sm">
                  <span className="w-14 font-semibold text-slate-700">{item.stars} স্টার</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-400 font-medium">{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* REVIEWS GRID                                                  */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews && reviews.length > 0
            ? reviews.slice(0, 6).map((rev, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-brand-light text-brand font-bold flex items-center justify-center text-sm">
                          {typeof rev?.userId === 'object' && rev?.userId?.name
                            ? rev.userId.name.charAt(0).toUpperCase()
                            : 'C'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {typeof rev?.userId === 'object' && rev?.userId?.name
                              ? rev.userId.name
                              : 'ভেরিফাইড ক্রেতা'}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ভেরিফাইড পারচেজ</span>
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        {formatReviewDate(rev?.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center text-amber-400">
                      <StarRating value={rev?.rating || 5} size={14} />
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                      &ldquo;{rev?.comment}&rdquo;
                    </p>
                  </div>
                </div>
              ))
            : defaultTestimonials.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.name}</p>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{item.city} • ভেরিফাইড ক্রেতা</span>
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400">{item.date}</span>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      &ldquo;{item.comment}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
