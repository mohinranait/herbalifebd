'use client';
import { useGetBrandsQuery } from '@/redux/service/brand';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from '@/components/shared/SectionHeader';
import { Building2 } from 'lucide-react';

const BrandsSection = () => {
  const { data, isLoading } = useGetBrandsQuery('page=1&limit=30&status=true&isDelete=false');
  const brands = data?.data || [];

  if (!isLoading && brands.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-8">
      <SectionHeader
        title="আমাদের ব্র্যান্ড সমূহ"
        icon="🏷️"
        seeAllLink="/brands"
        seeAllText="সবগুলো দেখুন"
      />

      <div className="container mx-auto px-2 md:px-4">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="relative group">
            <Carousel
              plugins={[
                Autoplay({
                  delay: 3000,
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
                {brands.map((brand) => (
                  <CarouselItem
                    key={brand._id}
                    className="pl-3 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                  >
                    <Link
                      href={`/shop?brand=${brand._id}`}
                      className="group/brand bg-white border border-slate-200 hover:border-orange-400 rounded-xl p-4 flex flex-col items-center justify-center h-28 transition-all duration-300"
                    >
                      {brand.logo ? (
                        <div className="relative w-full h-14 flex items-center justify-center overflow-hidden">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            width={120}
                            height={60}
                            className="max-h-12 w-auto object-contain transition-transform duration-300 group-hover/brand:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center">
                          <Building2 className="w-6 h-6 text-orange-500 mb-1" />
                          <span className="text-xs md:text-sm font-bold text-slate-800 line-clamp-1 group-hover/brand:text-orange-600 transition-colors">
                            {brand.name}
                          </span>
                        </div>
                      )}
                      {brand.logo && (
                        <span className="text-xs font-semibold text-slate-700 mt-1 line-clamp-1 group-hover/brand:text-orange-600 transition-colors">
                          {brand.name}
                        </span>
                      )}
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {brands.length > 6 && (
                <>
                  <CarouselPrevious className="bg-white text-slate-800 hover:bg-white/90 border border-slate-200 h-9 w-9 -left-2 md:-left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CarouselNext className="bg-white text-slate-800 hover:bg-white/90 border border-slate-200 h-9 w-9 -right-2 md:-right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandsSection;
