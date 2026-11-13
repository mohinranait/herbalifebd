'use client';

import React from 'react';
import { IProduct } from '@/redux/service/products/type';
import HorizontalProductCard from '@/components/products/HorizontalProductCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

type Props = {
  products: IProduct[] | undefined;
};

const NewArrivalsSlider = ({ products }: Props) => {
  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-2 md:px-4">
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm">কোন পণ্য পাওয়া যায়নি</p>
        </div>
      </div>
    );
  }

  // Group products into pairs of 2 for 2-row layout per column
  const columnPairs: Array<[IProduct, IProduct | undefined]> = [];
  for (let i = 0; i < products.length; i += 2) {
    columnPairs.push([products[i], products[i + 1]]);
  }

  return (
    <div className="container mx-auto px-2 md:px-4">
      <div className="relative">
        <Carousel
          opts={{
            align: 'start',
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {columnPairs.map(([topProduct, bottomProduct], idx) => (
              <CarouselItem
                key={topProduct?._id || idx}
                className="pl-3 md:pl-4 basis-[88%] sm:basis-1/2 lg:basis-1/3"
              >
                <div className="flex flex-col gap-3 md:gap-4 h-full">
                  <HorizontalProductCard product={topProduct} />
                  {bottomProduct && (
                    <HorizontalProductCard product={bottomProduct} />
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Controls */}
          {columnPairs.length > 3 && (
            <>
              <CarouselPrevious className="bg-white text-slate-700 hover:text-amber-500 hover:bg-slate-50 border border-slate-200 shadow-md h-9 w-9 sm:h-10 sm:w-10 -left-2 sm:-left-4 md:-left-5 z-10 disabled:opacity-0 disabled:pointer-events-none transition-all" />
              <CarouselNext className="bg-white text-slate-700 hover:text-amber-500 hover:bg-slate-50 border border-slate-200 shadow-md h-9 w-9 sm:h-10 sm:w-10 -right-2 sm:-right-4 md:-right-5 z-10 disabled:opacity-0 disabled:pointer-events-none transition-all" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
};

export default NewArrivalsSlider;
