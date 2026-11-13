'use client';

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  HeartHandshake,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { IProduct } from '@/redux/service/products/type';

interface LandingHighlightsProps {
  product: IProduct;
  onScrollToOrder: () => void;
}

export default function LandingHighlights({
  product,
  onScrollToOrder,
}: LandingHighlightsProps) {
  return (
    <section id="features" className="py-12 sm:py-16 bg-white border-t border-slate-100">
      <div className="container mx-auto max-w-[1240px] px-4 space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>কেন এই পণ্যটি সেরা?</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            স্বাভাবিক জীবনের সুস্থতায় আপনার নিখুঁত সঙ্গী
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            বাজারের সাধারণ পণ্যের চেয়ে কেন আমাদের {product.name} সবার চেয়ে এগিয়ে এবং গ্রাহকদের প্রথম পছন্দ।
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PROBLEM VS SOLUTION COMPARISON                                */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Negative Card (Ordinary products) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/50 border border-rose-200/80 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">সাধারণ বাজারজাত পণ্য</h3>
                <p className="text-xs text-slate-500">যেসব ঝুঁকি ও অনিশ্চয়তা থাকে</p>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                <span>উপাদানের সঠিক মান ও বিশুদ্ধতা যাচাই করা থাকে না</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                <span>ভেজাল বা নিম্নমানের নকল পণ্য পাওয়ার আশঙ্কা</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                <span>কার্যকারিতা নিয়ে কোনো সুনির্দিষ্ট গ্যারান্টি বা সাপোর্ট নেই</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                <span>পণ্য হাতে পেয়ে চেক করার সুযোগ প্রায়ই থাকে না</span>
              </li>
            </ul>
          </div>

          {/* Positive Card (Our Authentic Product) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50/70 border-2 border-emerald-300 shadow-md shadow-emerald-500/5 space-y-5 relative">
            <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow-xs">
              ১০০% প্রমাণিত
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">আমাদের আসল ও প্রিমিয়াম কালেকশন</h3>
                <p className="text-xs text-emerald-700 font-medium">নিখুঁত কোয়ালিটি ও পূর্ণাঙ্গ নিশ্চয়তা</p>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-slate-800 font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>আন্তর্জাতিক মানের অথেনটিক ও প্রিমিয়াম উপাদান</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>ল্যাব-টেস্টেড ফর্মুলা এবং সর্বোচ্চ গুণগত মান সুরক্ষিত</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>হাতে পেয়ে চেক করে নেওয়ার সম্পূর্ণ স্বাধীনতা</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>সন্তুষ্টির নিশ্চয়তা ও ৭ দিনের দ্রুত রিটার্ন বা রিপ্লেসমেন্ট</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4 FEATURE HIGHLIGHT CARDS                                     */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-brand/40 hover:bg-white hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">প্রাকৃতিক ও নিরাপদ</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              উন্নত উপাদান থেকে তৈরি, যা স্বাস্থ্যকর ও প্রতিদিনের ব্যবহারে সম্পূর্ণ নিরাপদ ও উপযোগী।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-brand/40 hover:bg-white hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">দ্রুত ও কার্যকর ফলাফল</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              নিয়মিত সঠিক ব্যবহারের মাধ্যমে আপনি অনুভব করবেন বাস্তব ও ইতিবাচক পরিবর্তন।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-brand/40 hover:bg-white hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">কোয়ালিটি সার্টিফাইড</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              প্রতিটি পণ্য কঠোর মান নিয়ন্ত্রণের মাধ্যমে নিশ্চিত হয়ে সরাসরি আপনার কাছে পৌঁছায়।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-brand/40 hover:bg-white hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">সম্পূর্ণ কাস্টমার সাপোর্ট</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              অর্ডারের পর থেকে প্রোডাক্ট ব্যবহার পর্যন্ত যেকোনো প্রয়োজনে আমাদের টিম আপনার পাশে রয়েছে।
            </p>
          </div>
        </div>

        {/* Action Trigger Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-current" />
              <span>সীমিত সময়ের স্টক অফার</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              দেরি না করে আজই আপনার আসল পণ্যটি সংগ্রহ করুন!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              ক্যাশ অন ডেলিভারিতে কোনো অগ্রিম পেমেন্ট ছাড়াই সারা বাংলাদেশ থেকে অর্ডার করুন।
            </p>
          </div>

          <button
            type="button"
            onClick={onScrollToOrder}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm text-slate-900 bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-105 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-98"
          >
            <span>এখনই অর্ডার করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
