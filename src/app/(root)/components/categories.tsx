'use client';

import { PRODUCT_IMG } from '@/lib/default-import';
import { useGetCategoriesQuery } from '@/redux/service/categories';
import { ICategory } from '@/redux/service/categories/type';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, LayoutGrid } from 'lucide-react';

const CategoryCard = ({ category }: { category: ICategory }) => {
  return (
    <Link
      href={`/shop?category=${category?.id}`}
      className="group flex flex-col items-center cursor-pointer transition-transform"
    >
      <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-34 md:h-34 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-orange-200/80 group-hover:border-orange-500 group-hover:scale-105 transition-all duration-300 p-1 shrink-0">
        <Image
          src={category?.thumbnail || `/${PRODUCT_IMG}`}
          width={180}
          height={180}
          alt={category.name}
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="text-center mt-2.5 max-w-[120px] md:max-w-[140px]">
        <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
          {category.name}
        </p>
        <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5 block">
          {category?.totalProducts || 0} টি পণ্য
        </span>
      </div>
    </Link>
  );
};

const Categories = () => {
  const { data, isLoading } = useGetCategoriesQuery('page=1&limit=20&isDelete=false&status=true');
  const categories = data?.data || [];
  const finalCategories = categories?.filter((cat) => cat.thumbnail) || categories;

  return (
    <section className="py-4 md:py-6">
      <div className="container px-2 md:px-4 mx-auto max-w-[1276px]">
        <div className="bg-linear-to-r from-orange-50/70 via-amber-50/40 to-orange-50/70 border border-orange-200/60 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 md:mb-7 pb-3 border-b border-orange-200/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-slate-800 tracking-tight">
                  জনপ্রিয় ক্যাটাগরি
                </h2>
                <p className="text-[11px] md:text-xs text-slate-500 hidden sm:block">
                  পছন্দের ক্যাটাগরি অনুযায়ী সেরা পণ্য খুঁজুন
                </p>
              </div>
            </div>

            <Link
              href="/categories"
              className="text-xs md:text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
            >
              <span>সবগুলো দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-white/70 border border-orange-100 animate-pulse" />
                  <div className="h-4 w-16 bg-orange-100/60 rounded mt-2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : finalCategories?.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-slate-500 text-sm">
              কোন ক্যাটাগরি পাওয়া যায়নি
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-6">
              {finalCategories.slice(0, 12).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;
