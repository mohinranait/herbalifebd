'use client';

import React from 'react';
import { IProduct } from '@/redux/service/products/type';
import ViewHTML from '@/components/shared/html-viewer/HTMLView';
import VideoSection from '@/app/(root)/products/[slug]/components/VideoSection';
import { BookOpen, Video, Tag } from 'lucide-react';

interface LandingDetailsProps {
  product: IProduct;
}

export default function LandingDetails({ product }: LandingDetailsProps) {
  return (
    <section className="py-12 sm:py-16 bg-slate-50/60 border-t border-slate-100">
      <div className="container mx-auto max-w-[1240px] px-4 space-y-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <BookOpen className="w-3.5 h-3.5" />
            <span>বিস্তারিত তথ্য ও পরিচিতি</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            প্রোডাক্ট বিবরণ ও কার্যপ্রণালী
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Description (Left / 7 cols) */}
          <div className={`space-y-6 ${product.videoUrl ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                পণ্য সম্পর্কে বিস্তারিত
              </h3>

              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base">
                {product?.description ? (
                  <ViewHTML htmlText={product.description} />
                ) : product?.shortDescription ? (
                  <p>{product.shortDescription}</p>
                ) : (
                  <p className="text-slate-500">
                    {product.name} একটি প্রিমিয়াম কোয়ালিটি পণ্য যা আপনার দৈনন্দিন সুস্থতা নিশ্চিত করতে বিশেষভাবে উপযোগী।
                  </p>
                )}
              </div>

              {/* Tags / Brand Information */}
              {product.tags && product.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>ট্যাগসমূহ:</span>
                  </span>
                  {product.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Video Section (Right / 5 cols) if present */}
          {product.videoUrl && (
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Video className="w-5 h-5 text-rose-500" />
                  <span>ভিডিও রিভিউ ও ডেমো</span>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-md">
                  <VideoSection url={product.videoUrl} />
                </div>

                <p className="text-xs text-slate-500 text-center">
                  ভিডিওতে পণ্যটির আসল রূপ ও ব্যবহারের নিয়মাবলী পরিষ্কারভাবে দেখানো হয়েছে।
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
