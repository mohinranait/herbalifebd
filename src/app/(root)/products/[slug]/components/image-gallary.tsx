"use client";

import { IProduct } from "@/redux/service/products/type";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { PRODUCT_IMG } from "@/lib/default-import";

type Props = {
  product: IProduct;
  images: string[];
  stock: number;
};

const ImageGallery = ({ product, images, stock }: Props) => {
  const [api, setApi] = useState<CarouselApi>();
  const [lightboxApi, setLightboxApi] = useState<CarouselApi>();

  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // zoom
  const [zoomed, setZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50,
  });

  const imageRef = useRef<HTMLDivElement | null>(null);
  const thumbScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    onSelect();
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    api.scrollTo(0, true);
  }, [images, api]);

  // Auto-scroll the active thumbnail into view
  useEffect(() => {
    if (thumbScrollRef.current && thumbScrollRef.current.children[current]) {
      const activeThumb = thumbScrollRef.current.children[current] as HTMLElement;
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [current]);

  useEffect(() => {
    if (!lightboxApi) return;
    lightboxApi.scrollTo(current, true);
  }, [current, lightboxApi]);

  useEffect(() => {
    if (!lightboxApi) return;

    const onSelect = () => {
      const index = lightboxApi.selectedScrollSnap();
      setCurrent(index);
      api?.scrollTo(index);
    };

    lightboxApi.on("select", onSelect);

    return () => {
      lightboxApi.off("select", onSelect);
    };
  }, [lightboxApi, api]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") lightboxApi?.scrollNext();
      if (e.key === "ArrowLeft") lightboxApi?.scrollPrev();
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxApi, lightboxOpen]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageRef.current) return;
      const rect = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    },
    []
  );

  const displayImages = images && images.length > 0 ? images : [`/${PRODUCT_IMG}`];

  const scrollThumbs = (direction: "left" | "right") => {
    if (thumbScrollRef.current) {
      const offset = direction === "left" ? -120 : 120;
      thumbScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* ----------------------------------------------------------------- */}
        {/* MAIN LARGE PREVIEW BOX                                            */}
        {/* ----------------------------------------------------------------- */}
        <div className="relative bg-white border border-slate-200 rounded-xl overflow-hidden aspect-square flex items-center justify-center p-2 group w-full">
          {stock === 0 && (
            <div className="absolute top-3 right-3 z-30">
              <span className="px-2.5 py-1 rounded bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider">
                স্টক আউট
              </span>
            </div>
          )}

          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: displayImages.length > 1,
            }}
            className="w-full h-full"
          >
            <CarouselContent className="ml-0 h-full">
              {displayImages.map((img, index) => (
                <CarouselItem key={`${img}-${index}`} className="pl-0 h-full">
                  <div
                    ref={index === current ? imageRef : undefined}
                    onClick={() => setLightboxOpen(true)}
                    onMouseEnter={() => setZoomed(true)}
                    onMouseLeave={() => setZoomed(false)}
                    onMouseMove={index === current ? handleMouseMove : undefined}
                    className={`relative w-full h-full aspect-square overflow-hidden ${
                      zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                    }`}
                    style={
                      zoomed && index === current
                        ? {
                            transform: "scale(1.7)",
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            transition: "transform .12s ease",
                          }
                        : {
                            transform: "scale(1)",
                            transition: "transform .3s ease",
                          }
                    }
                  >
                    <Image
                      src={img || `/${PRODUCT_IMG}`}
                      alt={`${product?.name}-${index}`}
                      fill
                      priority={index === 0}
                      className="object-contain p-2"
                      sizes="(max-width:768px) 100vw, 50vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Navigation Arrows for Main Preview */}
          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                aria-label="Previous image"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border border-slate-200 p-1.5 text-slate-700 opacity-0 group-hover:opacity-100 hover:bg-[#ff7a00] hover:text-white hover:border-[#ff7a00] transition-all cursor-pointer z-20"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => api?.scrollNext()}
                aria-label="Next image"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border border-slate-200 p-1.5 text-slate-700 opacity-0 group-hover:opacity-100 hover:bg-[#ff7a00] hover:text-white hover:border-[#ff7a00] transition-all cursor-pointer z-20"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Zoom hint */}
          <div className="pointer-events-none absolute bottom-2.5 right-2.5 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-20">
            <ZoomIn className="h-3 w-3" />
            <span>জুম করুন</span>
          </div>

          {/* Image index counter badge */}
          {displayImages.length > 1 && (
            <div className="absolute left-3 top-3 z-20 rounded bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
              {current + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* THUMBNAILS CAROUSEL (Directly under the main image)              */}
        {/* ----------------------------------------------------------------- */}
        {displayImages.length > 1 && (
          <div className="relative group/thumbs w-full px-1">
            {/* Scrollable Thumbnails Strip */}
            <div
              ref={thumbScrollRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
            >
              {displayImages.map((img, index) => {
                const isSelected = current === index;
                return (
                  <button
                    key={`thumb-${index}`}
                    type="button"
                    onClick={() => api?.scrollTo(index)}
                    aria-label={`View image ${index + 1}`}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-white p-1 ${
                      isSelected
                        ? "border-[#ff7a00] ring-2 ring-[#ff7a00]/30 scale-102"
                        : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`thumb-${index}`}
                      fill
                      className="object-contain p-0.5"
                      sizes="80px"
                    />
                  </button>
                );
              })}
            </div>

            {/* Left Scroll Arrow */}
            {displayImages.length > 4 && (
              <button
                type="button"
                onClick={() => scrollThumbs("left")}
                aria-label="Previous thumbnails"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-[#ff7a00] hover:text-white hover:border-[#ff7a00] flex items-center justify-center transition-colors cursor-pointer z-10 opacity-90 hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Right Scroll Arrow */}
            {displayImages.length > 4 && (
              <button
                type="button"
                onClick={() => scrollThumbs("right")}
                aria-label="Next thumbnails"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-[#ff7a00] hover:text-white hover:border-[#ff7a00] flex items-center justify-center transition-colors cursor-pointer z-10 opacity-90 hover:opacity-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* LIGHTBOX MODAL                                                    */}
      {/* ----------------------------------------------------------------- */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xs"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="absolute left-4 top-4 z-50 text-sm font-medium text-white/80">
            {current + 1} / {displayImages.length}
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative mx-4 sm:mx-14 w-full max-w-4xl"
          >
            <Carousel
              setApi={setLightboxApi}
              opts={{
                loop: displayImages.length > 1,
                startIndex: current,
              }}
              className="w-full"
            >
              <CarouselContent>
                {displayImages.map((img, index) => (
                  <CarouselItem key={index}>
                    <div className="relative h-[70vh] md:h-[80vh] w-full">
                      <Image
                        src={img}
                        alt={`${product?.name}-${index}`}
                        fill
                        className="object-contain"
                        sizes="100vw"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => lightboxApi?.scrollPrev()}
                  className="absolute -left-3 sm:-left-12 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2.5 text-white hover:bg-white/30 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  type="button"
                  onClick={() => lightboxApi?.scrollNext()}
                  className="absolute -right-3 sm:-right-12 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2.5 text-white hover:bg-white/30 transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
