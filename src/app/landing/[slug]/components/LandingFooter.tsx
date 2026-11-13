'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Phone, Mail, Sparkles, ExternalLink } from 'lucide-react';
import { IAppSettings } from '@/models/app-setting';

interface LandingFooterProps {
  appSetting?: IAppSettings | null;
  productSlug: string;
}

export default function LandingFooter({ appSetting, productSlug }: LandingFooterProps) {
  const currentYear = new Date().getFullYear();
  const phone = appSetting?.contactPhone || '01602094399';
  const email = appSetting?.contactEmail || 'support@herbalifebd.com';

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs sm:text-sm border-t border-slate-800 pt-12 pb-24 lg:pb-12">
      <div className="container mx-auto max-w-[1240px] px-4 space-y-8">
        {/* Top Trust Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-8 border-b border-slate-800 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-brand flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">১০০% আসল প্রোডাক্ট</p>
              <p className="text-xs text-slate-400">প্রতিটি পণ্য শতভাগ খাঁটি ও পরীক্ষিত</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">ক্যাশ অন হোম ডেলিভারি</p>
              <p className="text-xs text-slate-400">হাতে পেয়ে দেখে মূল্য পরিশোধ করুন</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">হটলাইন সাপোর্ট</p>
              <p className="text-xs text-slate-400">যেকোনো প্রয়োজনে কল করুন: {phone}</p>
            </div>
          </div>
        </div>

        {/* Middle Details */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2 font-black text-lg text-white">
              <Sparkles className="w-4 h-4 text-brand" />
              <span>{appSetting?.siteName || 'Herbalife BD'}</span>
            </div>
            <p className="text-xs text-slate-400">
              আপনার সুস্থ ও সুন্দর জীবনের নিশ্চয়তায় প্রিমিয়াম ও আসল পণ্যের নির্ভরযোগ্য শপ।
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <a href={`tel:${phone}`} className="hover:text-white transition-colors flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              <span>{phone}</span>
            </a>
            <span className="text-slate-700">•</span>
            <a href={`mailto:${email}`} className="hover:text-white transition-colors flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{email}</span>
            </a>
            <span className="text-slate-700">•</span>
            <Link
              href={`/products/${productSlug}`}
              className="hover:text-brand transition-colors flex items-center gap-1 text-slate-300 font-semibold"
            >
              <span>ক্যাটালগ ভিউ</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 text-center sm:text-left">
          <p>© {currentYear} {appSetting?.siteName || 'Herbalife BD'}. সর্বস্বত্ব সংরক্ষিত।</p>
          <p>সুরক্ষিত চেকআউট ও নিরাপদ ক্যাশ অন ডেলিভারি সিস্টেম।</p>
        </div>
      </div>
    </footer>
  );
}
