'use client';

import { useGetCategoriesQuery } from '@/redux/service/categories';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { PRODUCT_IMG } from "@/lib/default-import";
import { ICategory } from '@/redux/service/categories/type';
import Link from 'next/link';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const CategoryCard = ({ category }: { category: ICategory }) => {
  return (
    <Link
      href={`/shop?category=${category?.id}`}
      className="group flex flex-col items-center cursor-pointer transition-transform"
    >
      <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-34 md:h-34 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-brand-border group-hover:border-brand group-hover:scale-105 transition-all duration-300 p-1 shrink-0">
        <Image
          src={category?.thumbnail || `/${PRODUCT_IMG}`}
          width={180}
          height={180}
          alt={category.name}
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="text-center mt-2.5 max-w-[120px] md:max-w-[140px]">
        <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug line-clamp-1 group-hover:text-brand transition-colors">
          {category.name}
        </p>
        <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5 block">
          {category?.totalProducts || 0} টি পণ্য
        </span>
      </div>
    </Link>
  );
};

const SliderCategories = () => {
  const t = useTranslation();
  const { data, isLoading } = useGetCategoriesQuery('page=1&limit=20&isDelete=false&status=true');
  const categories = data?.data || [];
  const finalCategories = categories?.filter((cat) => cat.thumbnail) || categories;

  return (
    <section className="py-4 md:py-6">
      <div className="container px-2 md:px-4 mx-auto max-w-[1276px]">
        {/* Harmonious Theme Matched Background Box */}
        <div className="bg-brand-light border border-brand-border rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 md:mb-7 pb-3 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand text-brand-foreground flex items-center justify-center shrink-0">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-slate-800 tracking-tight">
                  {t["popular-categories-title"] || "জনপ্রিয় ক্যাটাগরি"}
                </h2>
                <p className="text-[11px] md:text-xs text-slate-500 hidden sm:block">
                  {t["popular-categories-desc"] || "পছন্দের ক্যাটাগরি অনুযায়ী সেরা পণ্য খুঁজুন"}
                </p>
              </div>
            </div>

            <Link
              href="/categories"
              className="text-xs md:text-sm font-semibold text-brand hover:opacity-80 flex items-center gap-1 transition-colors"
            >
              <span>{t["see-all-text"] || "সবগুলো দেখুন"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Categories Slider */}
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-white/70 border border-brand-border animate-pulse" />
                  <div className="h-4 w-16 bg-brand-light rounded mt-2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : finalCategories?.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-slate-500 text-sm">
              কোন ক্যাটাগরি পাওয়া যায়নি
            </div>
          ) : (
            <div className="relative group">
              <Carousel
                plugins={[
                  Autoplay({
                    delay: 3500,
                    stopOnInteraction: false,
                  }),
                ]}
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-3 md:-ml-4">
                  {finalCategories.map((category) => (
                    <CarouselItem
                      key={category.id}
                      className="pl-3 md:pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                    >
                      <CategoryCard category={category} />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="bg-white text-slate-700 hover:text-brand hover:bg-brand-light border border-brand-border h-9 w-9 -left-2 md:-left-4 opacity-0 group-hover:opacity-100 transition-all" />
                <CarouselNext className="bg-white text-slate-700 hover:text-brand hover:bg-brand-light border border-brand-border h-9 w-9 -right-2 md:-right-4 opacity-0 group-hover:opacity-100 transition-all" />
              </Carousel>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SliderCategories;
