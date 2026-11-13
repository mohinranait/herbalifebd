'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { IProduct } from '@/redux/service/products/type';
import { CURRENCY } from '@/lib/envSecret';
import findProductImage from '@/hooks/useFindProductImage';
import { getSingleProductPrice } from '@/hooks/useGerPrice';
import { showTwoDecimals } from '@/lib/helpers';
import { useTranslation } from '@/hooks/useTranslation';

type Props = {
  product: IProduct;
};

const formatPrice = (price: number) => {
  return price % 1 === 0 ? Math.round(price) : showTwoDecimals(price);
};

const HorizontalProductCard = ({ product }: Props) => {
  const t = useTranslation();
  const {
    name,
    slug,
    productType,
    variations,
    ratingsAverage,
    totalReviews,
    brand,
    stock,
  } = product || {};

  const productImage = findProductImage({ product });
  const singleProductPrice = getSingleProductPrice(product);

  let displayPrice = 0;
  let originalPrice = 0;
  let discountPercent = 0;

  if (productType === 'single') {
    displayPrice = singleProductPrice?.finalPrice || 0;
    originalPrice = singleProductPrice?.price || 0;
    if (originalPrice > displayPrice && originalPrice > 0) {
      discountPercent = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
    }
  } else if (productType === 'variant' && variations?.length) {
    const prices = variations.map((v) => ({
      final: (v.price || 0) - (v.offerPriceFixed || 0),
      orig: v.price || 0,
    }));
    const minVariant = prices.reduce(
      (prev, curr) => (curr.final < prev.final ? curr : prev),
      prices[0]
    );
    displayPrice = minVariant?.final || 0;
    originalPrice = minVariant?.orig || 0;
    if (originalPrice > displayPrice && originalPrice > 0) {
      discountPercent = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
    }
  }

  const brandName = brand?.name || 'No Brand';
  const isStockOut = (stock ?? 0) === 0;

  return (
    <Link
      href={`/products/${slug}`}
      className="group relative bg-white border border-slate-200/90 hover:border-brand rounded-2xl p-2.5 sm:p-3 transition-all duration-300 hover:shadow-sm flex items-center gap-2.5 sm:gap-3.5 block overflow-hidden"
    >
      {/* Product Image */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
        {productImage && (
          <Image
            src={productImage}
            alt={name || 'Product'}
            fill
            sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
            className="object-cover p-1 rounded-lg group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {isStockOut && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded">
              {t["out-of-stock"] || "স্টক নেই"}
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        {/* Brand */}
        <div>
          <span className="text-[11px] sm:text-xs font-medium text-brand capitalize block truncate">
            {brandName}
          </span>

          {/* Title */}
          <h3
            className="text-xs sm:text-sm md:text-[15px] font-bold text-slate-800 group-hover:text-brand transition-colors line-clamp-1 leading-snug mt-0.5"
            title={name}
          >
            {name}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 my-1">
          <span>{ratingsAverage ? Number(ratingsAverage).toFixed(0) : '0'}</span>
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{totalReviews || 0}</span>
        </div>

        {/* Price & Discount */}
        <div className="flex items-center gap-2 flex-wrap mt-auto">
          <span className="text-rose-600 font-bold text-sm sm:text-base md:text-lg">
            {CURRENCY}
            {formatPrice(displayPrice)}
          </span>

          {discountPercent > 0 && originalPrice > displayPrice && (
            <>
              <del className="text-xs sm:text-sm text-slate-400 line-through font-normal">
                {CURRENCY}
                {formatPrice(originalPrice)}
              </del>
              <span className="bg-rose-500 text-white font-bold text-[10px] sm:text-xs px-1.5 py-0.5 rounded shrink-0">
                {discountPercent}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default HorizontalProductCard;
