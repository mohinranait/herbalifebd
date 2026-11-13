'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useGetSlidersQuery } from '@/redux/service/sliders';
import { useGetAppSettingQuery } from '@/redux/service/setting';
import { RotateCcw, Truck, ShieldCheck, Headphones } from 'lucide-react';

const HeroSection = () => {
  const { data } = useGetSlidersQuery(`page=1&limit=10&isDelete=false&status=true`);
  const { data: appSetting } = useGetAppSettingQuery();
  const isBanner = appSetting?.features?.bannerSlider;

  // Filter valid sliders only
  const validSliders = React.useMemo(() => {
    return data?.data?.filter((slide) => {
      if (!slide || !slide.sliderType) return false;
      if (slide.sliderType === 'directImage') {
        return slide.image;
      }
      return !!slide.title?.trim();
    }) || [];
  }, [data?.data]);

  const trustFeatures = [
    {
      icon: RotateCcw,
      title: "সহজে পরিবর্তনের নিশ্চয়তা",
      subtitle: "সহজ রিটার্ন ও রিপ্লেসমেন্ট"
    },
    {
      icon: Truck,
      title: "সারাদেশ ক্যাশ অন হোম ডেলিভারি",
      subtitle: "দ্রুততম সময়ে পণ্য পৌঁছানো"
    },
    {
      icon: ShieldCheck,
      title: "নিরাপদে পেমেন্ট করার সহজ মাধ্যম",
      subtitle: "১০০% নিরাপদ ও সুরক্ষিত"
    },
    {
      icon: Headphones,
      title: "সর্বক্ষণিক ও দ্রুত গ্রাহক সেবা",
      subtitle: "২৪/৭ সার্বক্ষণিক সহায়তা"
    }
  ];

  return (
    <section className="pt-2 md:pt-4">
      <div className="container px-2 md:px-4 mx-auto">
        {/* Slider */}
        {validSliders.length > 0 && isBanner && (
          <div className="relative group rounded-2xl overflow-hidden border border-slate-200">
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
              <CarouselContent>
                {validSliders.map((slide) => {
                  const hasLink = !!slide.link?.trim();

                  if (slide.sliderType === 'directImage') {
                    return (
                      <CarouselItem key={slide.id}>
                        <div className="relative h-44 sm:h-64 md:h-80 lg:h-96 xl:h-[460px] w-full overflow-hidden rounded-2xl bg-slate-100">
                          {slide.image && (
                            <Image
                              src={slide.image}
                              alt={slide.title || "Slider Image"}
                              width={1600}
                              height={700}
                              className="object-cover w-full h-full"
                              priority
                            />
                          )}
                          {hasLink && (
                            <Link
                              href={slide.link || '/'}
                              className="absolute inset-0 z-10"
                              aria-label={slide.title}
                            />
                          )}
                        </div>
                      </CarouselItem>
                    );
                  }

                  const isWithImage = slide.sliderType === 'withImage';

                  return (
                    <CarouselItem key={slide.id}>
                      <div
                        className={`relative h-44 sm:h-64 md:h-80 lg:h-96 xl:h-[460px] flex items-center rounded-2xl overflow-hidden
                          ${isWithImage
                            ? 'bg-cover bg-center'
                            : 'bg-linear-to-r from-slate-900 to-slate-800'}`}
                        style={
                          isWithImage && slide.image
                            ? { backgroundImage: `url(${slide.image})` }
                            : undefined
                        }
                      >
                        {isWithImage && <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />}

                        <div className="mx-auto px-6 relative z-10 text-center">
                          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 md:mb-4 text-white">
                            {slide.title}
                          </h2>

                          {slide.description && (
                            <p className="text-xs sm:text-sm md:text-base lg:text-lg mb-4 text-white/90 max-w-2xl mx-auto">
                              {slide.description}
                            </p>
                          )}

                          {slide.buttonName && hasLink && (
                            <Link href={slide.link || '/'}>
                              <Button
                                size="lg"
                                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-xl"
                              >
                                {slide.buttonName}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              {validSliders.length > 1 && (
                <>
                  <CarouselPrevious className="left-3 md:left-6 bg-white/90 hover:bg-white text-slate-800 border border-slate-200 h-9 w-9 md:h-11 md:w-11 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CarouselNext className="right-3 md:right-6 bg-white/90 hover:bg-white text-slate-800 border border-slate-200 h-9 w-9 md:h-11 md:w-11 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </Carousel>
          </div>
        )}

        {/* Sokherhut Style Trust Highlights Card */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 md:p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {trustFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 ${idx > 0 ? "pt-3 md:pt-0 md:pl-4" : ""}`}
                >
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] md:text-xs text-slate-500 line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
