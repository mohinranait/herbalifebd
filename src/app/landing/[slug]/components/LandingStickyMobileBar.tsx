'use client';

import React from 'react';
import { ShoppingBag, Phone, MessageCircle } from 'lucide-react';
import { CURRENCY } from '@/lib/envSecret';

interface LandingStickyMobileBarProps {
  offerPrice: number;
  phone: string;
  waUrl: string;
  onScrollToOrder: () => void;
}

export default function LandingStickyMobileBar({
  offerPrice,
  phone,
  waUrl,
  onScrollToOrder,
}: LandingStickyMobileBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2.5 px-4 lg:hidden shadow-2xl shadow-slate-900/20 safe-area-bottom">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Price Info */}
        <div className="min-w-0 pr-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            অফার মূল্য
          </p>
          <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {CURRENCY} {offerPrice.toLocaleString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0"
            title="WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>

          <a
            href={`tel:${phone}`}
            className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={onScrollToOrder}
            className="h-11 px-5 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-brand to-amber-500 shadow-md shadow-brand/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>অর্ডার করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
