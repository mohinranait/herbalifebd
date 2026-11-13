'use client';

import React from 'react';
import { Compass, Check, AlertCircle } from 'lucide-react';
import { IProduct } from '@/redux/service/products/type';

interface LandingHowToUseProps {
  product: IProduct;
}

export default function LandingHowToUse({ product }: LandingHowToUseProps) {
  const steps = [
    {
      number: '০১',
      title: 'সঠিক নিয়মে প্রস্তুত করুন',
      desc: 'প্যাকেট বা নির্দেশিকা অনুযায়ী নির্দেশিত পরিমাপে পণ্যটি ব্যবহারের জন্য প্রস্তুত করুন।',
      tip: 'অতিরিক্ত বা কম পরিমাপে ব্যবহার এড়িয়ে চলুন',
    },
    {
      number: '০২',
      title: 'নির্দিষ্ট সময়ে নিয়মমাফিক ব্যবহার',
      desc: 'প্রতিদিন একটি নির্দিষ্ট রুটিন মেনে নিয়মমতো সেবন বা প্রয়োগ করুন।',
      tip: 'পর্যাপ্ত পানি পান ও পরিমিত খাদ্যাভ্যাস বজায় রাখুন',
    },
    {
      number: '০৩',
      title: 'দৃশ্যমান পরিবর্তন ও সুস্থতা উপভোগ',
      desc: 'নিয়মিত ব্যবহারের পর আপনি নিজের মধ্যে কাঙ্ক্ষিত ও ইতিবাচক রূপান্তর লক্ষ্য করবেন।',
      tip: 'সর্বোত্তম ফলাফলের জন্য নিয়মিত চালিয়ে যান',
    },
  ];

  return (
    <section id="usage" className="py-12 sm:py-16 bg-white border-t border-slate-100">
      <div className="container mx-auto max-w-[1240px] px-4 space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Compass className="w-3.5 h-3.5" />
            <span>সঠিক নির্দেশিকা</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ব্যবহারের সহজ ৩টি ধাপ
          </h2>

          <p className="text-sm sm:text-base text-slate-600">
            সেরা ফলাফল পেতে নিচের সহজ ধাপগুলো অনুসরণ করুন
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 sm:p-8 rounded-3xl bg-slate-50/70 border border-slate-200 hover:border-brand/50 hover:bg-white hover:shadow-xl transition-all duration-300 space-y-4 group"
            >
              {/* Step Number Badge */}
              <div className="flex items-center justify-between">
                <span className="text-3xl sm:text-4xl font-black text-brand/30 group-hover:text-brand transition-colors font-mono">
                  {step.number}
                </span>
                <span className="w-8 h-8 rounded-full bg-brand-light text-brand font-bold text-xs flex items-center justify-center">
                  ধাপ {idx + 1}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Pro Tip Box */}
              <div className="pt-2">
                <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2 shadow-2xs">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{step.tip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Precautions notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs sm:text-sm text-amber-900 flex items-center gap-3 max-w-3xl mx-auto">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>বিশেষ দ্রষ্টব্য:</strong> যেকোনো স্বাস্থ্যগত জটিলতা থাকলে অথবা গর্ভবতী মায়েদের ক্ষেত্রে ব্যবহারের আগে চিকিৎসকের পরামর্শ গ্রহণ করা উচিত।
          </span>
        </div>
      </div>
    </section>
  );
}
