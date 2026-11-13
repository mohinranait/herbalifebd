'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MessageCircle, ShoppingBag, Flame, Sparkles } from 'lucide-react';
import { IAppSettings } from '@/models/app-setting';

interface LandingHeaderProps {
  appSetting?: IAppSettings | null;
  onScrollToOrder: () => void;
  productName: string;
}

export default function LandingHeader({
  appSetting,
  onScrollToOrder,
  productName,
}: LandingHeaderProps) {
  // 3-hour persistent urgency countdown
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 2,
    minutes: 48,
    seconds: 35,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 2, minutes: 45, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const phone = appSetting?.contactPhone || '01602094399';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/88${cleanPhone.startsWith('88') ? cleanPhone.slice(2) : cleanPhone}?text=${encodeURIComponent(
    `হ্যালো! আমি "${productName}" সম্পর্কে জানতে এবং অর্ডার করতে চাই।`
  )}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* ------------------------------------------------------------- */}
      {/* URGENCY TOP ANNOUNCEMENT BAR                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white text-xs sm:text-sm py-2 px-3 sm:px-6">
        <div className="container mx-auto max-w-[1240px] flex flex-wrap items-center justify-between gap-2">
          {/* Animated urgency message */}
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
            </span>
            <span className="inline-flex items-center gap-1 font-semibold">
              <Flame className="w-3.5 h-3.5 fill-current text-yellow-300" />
              <span>ধামাকা অফার! আজকের অর্ডারে বিশেষ ডিসকাউন্ট ও ক্যাশ অন ডেলিভারি</span>
            </span>
          </div>

          {/* Countdown & Quick Action */}
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <div className="flex items-center gap-1 bg-black/25 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-wider">
              <span>অফার বাকি:</span>
              <span className="text-yellow-300">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>

            <a
              href={`tel:${phone}`}
              className="hidden md:inline-flex items-center gap-1 font-bold hover:text-yellow-200 transition-colors"
            >
              <Phone className="w-3 h-3 fill-current" />
              <span>{phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STANDALONE LANDING NAV BAR                                    */}
      {/* ------------------------------------------------------------- */}
      <div className="container mx-auto max-w-[1240px] px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          {appSetting?.logo ? (
            <div className="relative h-9 sm:h-11 w-32 sm:w-40">
              <Image
                src={appSetting.logo}
                alt={appSetting?.siteName || 'Store Logo'}
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 font-black text-xl sm:text-2xl tracking-tight text-slate-900">
              <span className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center text-sm shadow-md shadow-brand/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <span>{appSetting?.siteName || 'Herbalife BD'}</span>
            </div>
          )}
        </div>

        {/* Quick Landing Anchor Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-brand transition-colors">
            উপকারিতা
          </a>
          <a href="#usage" className="hover:text-brand transition-colors">
            ব্যবহারের নিয়ম
          </a>
          <a href="#reviews" className="hover:text-brand transition-colors">
            গ্রাহক মতামত
          </a>
          <a href="#faq" className="hover:text-brand transition-colors">
            সাধারণ জিজ্ঞাসা
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer shadow-2xs"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          <a
            href={`tel:${phone}`}
            className="inline-flex sm:hidden items-center justify-center w-9 h-9 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            title="কল করুন"
          >
            <Phone className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={onScrollToOrder}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-brand via-orange-500 to-amber-500 hover:brightness-105 shadow-md shadow-brand/25 transition-all cursor-pointer active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>অর্ডার করুন</span>
          </button>
        </div>
      </div>
    </header>
  );
}
