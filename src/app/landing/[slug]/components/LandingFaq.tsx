'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function LandingFaq() {
  const faqs = [
    {
      q: 'পণ্যটি কি ১০০% অরিজিনাল?',
      a: 'হ্যাঁ, আমাদের প্রতিটি পণ্য সম্পূর্ণ অরিজিনাল, ইনট্যাক্ট এবং অথেনটিক। আমরা সরাসরি ভেরিফাইড সোর্স থেকে পণ্য সংগ্রহ করি এবং কোনো ধরনের নকল বা রেপ্লিকা পণ্য বিক্রি করি না।',
    },
    {
      q: 'ডেলিভারি পেতে কতদিন সময় লাগবে?',
      a: 'ঢাকার ভিতরে সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২ থেকে ৩ কার্যদিবসের মধ্যে আপনার ঠিকানায় হোম ডেলিভারি পৌঁছে দেওয়া হয়।',
    },
    {
      q: 'আমি কি ডেলিভারির সময় পণ্য দেখে নিতে পারব?',
      a: 'অবশ্যই! আমাদের ডেলিভারি ম্যানের সামনে প্যাকেট খুলে পণ্য দেখে ও চেক করে তারপর মূল্য পরিশোধ করতে পারবেন।',
    },
    {
      q: 'অর্ডার করতে কোনো অগ্রিম টাকা দিতে হবে কি?',
      a: 'না, আমাদের কাছে অর্ডার করতে কোনো প্রকার অগ্রিম টাকা দিতে হবে না। সম্পূর্ণ ক্যাশ অন ডেলিভারিতে পণ্য হাতে পেয়ে টাকা পরিশোধ করবেন।',
    },
    {
      q: 'পণ্যে কোনো সমস্যা থাকলে কি রিটার্ন করা যাবে?',
      a: 'যদি পণ্যটি ক্ষতিগ্রস্ত হয় বা ভুল পণ্য পৌঁছে থাকে, তাহলে ডেলিভারি ম্যানের কাছে থাকা অবস্থাতেই রিটার্ন করতে পারবেন অথবা ৭ দিনের মধ্যে আমাদের হটলাইনে যোগাযোগ করে সহজ রিপ্লেসমেন্ট সুবিধা পাবেন।',
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-12 sm:py-16 bg-white border-t border-slate-100">
      <div className="container mx-auto max-w-[900px] px-4 space-y-10">
        {/* Section Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>সচরাচর জিজ্ঞাসা</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            সাধারণ কিছু প্রশ্নের উত্তর
          </h2>

          <p className="text-sm text-slate-500">
            অর্ডারের পূর্বে আপনার জানার বিষয়গুলো জেনে নিন
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-brand/40 bg-orange-50/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform shrink-0 ${
                      isOpen ? 'rotate-180 bg-brand text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
