'use client';

import React, { useMemo, useCallback } from 'react';
import { IProduct } from '@/redux/service/products/type';
import { IProductCommentItem } from '@/lib/storefront-data';
import { useGetAppSettingQuery } from '@/redux/service/setting';
import LandingHeader from './LandingHeader';
import LandingHero from './LandingHero';
import LandingHighlights from './LandingHighlights';
import LandingDetails from './LandingDetails';
import LandingHowToUse from './LandingHowToUse';
import LandingReviews from './LandingReviews';
import LandingOrderSection from './LandingOrderSection';
import LandingFaq from './LandingFaq';
import LandingFooter from './LandingFooter';
import LandingStickyMobileBar from './LandingStickyMobileBar';

interface LandingViewProps {
  product: IProduct;
  initialComments?: IProductCommentItem[] | null;
}

export default function LandingView({ product, initialComments }: LandingViewProps) {
  const { data: appSetting } = useGetAppSettingQuery();

  // Baseline price calculation for hero display
  const isVariant = product.productType === 'variant' && Boolean(product.variations && product.variations.length > 0);

  const regularPrice = useMemo(() => {
    if (isVariant && product.variations?.[0]) {
      return product.variations[0].price || 0;
    }
    return product.price || 0;
  }, [isVariant, product]);

  const offerPrice = useMemo(() => {
    if (isVariant && product.variations?.[0]) {
      const v = product.variations[0];
      if (v.offerPriceFixed && v.offerPriceFixed > 0) {
        return Math.max(0, (v.price ?? 0) - v.offerPriceFixed);
      }
      return v.price || 0;
    }
    if (product.discountPrice && product.discountPrice > 0) {
      return Math.max(0, (product.price || 0) - product.discountPrice);
    }
    return product.price || 0;
  }, [isVariant, product]);

  const discountPercent = useMemo(() => {
    if (regularPrice <= 0 || regularPrice <= offerPrice) return 0;
    return ((regularPrice - offerPrice) / regularPrice) * 100;
  }, [regularPrice, offerPrice]);

  const scrollToOrder = useCallback(() => {
    const el = document.getElementById('order-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const phone = appSetting?.contactPhone || '01602094399';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/88${cleanPhone.startsWith('88') ? cleanPhone.slice(2) : cleanPhone}?text=${encodeURIComponent(
    `হ্যালো! আমি "${product.name}" সম্পর্কে জানতে এবং অর্ডার করতে চাই।`
  )}`;

  const reviews = initialComments || [];
  const avgRating = product.ratingsAverage || 4.9;
  const totalReviews = product.totalReviews || reviews.length || 128;

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased selection:bg-brand selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* 1. STANDALONE URGENCY HEADER & BRAND NAV                      */}
      {/* ------------------------------------------------------------- */}
      <LandingHeader
        appSetting={appSetting}
        onScrollToOrder={scrollToOrder}
        productName={product.name}
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO SHOWCASE (INFORMATIVE, NO VARIANT SELECTOR HERE)       */}
      {/* ------------------------------------------------------------- */}
      <LandingHero
        product={product}
        appSetting={appSetting}
        onScrollToOrder={scrollToOrder}
        offerPrice={offerPrice}
        regularPrice={regularPrice}
        discountPercent={discountPercent}
      />

      {/* ------------------------------------------------------------- */}
      {/* 3. PROBLEM VS SOLUTION & VALUE PILLARS                         */}
      {/* ------------------------------------------------------------- */}
      <LandingHighlights
        product={product}
        onScrollToOrder={scrollToOrder}
      />

      {/* ------------------------------------------------------------- */}
      {/* 4. PRODUCT DETAILS, SPECIFICATIONS & VIDEO DEMO               */}
      {/* ------------------------------------------------------------- */}
      <LandingDetails product={product} />

      {/* ------------------------------------------------------------- */}
      {/* 5. 3-STEP USAGE GUIDE & HEALTH TIPS                           */}
      {/* ------------------------------------------------------------- */}
      <LandingHowToUse product={product} />

      {/* ------------------------------------------------------------- */}
      {/* 6. VERIFIED CUSTOMER REVIEWS & TESTIMONIALS                   */}
      {/* ------------------------------------------------------------- */}
      <LandingReviews
        productName={product.name}
        reviews={reviews}
        avgRating={avgRating}
        totalReviews={totalReviews}
      />

      {/* ------------------------------------------------------------- */}
      {/* 7. "সহজে অর্ডার করুন" - VARIANT CARDS WITH CHECKBOX + FORM   */}
      {/* ------------------------------------------------------------- */}
      <LandingOrderSection
        product={product}
        appSetting={appSetting}
      />

      {/* ------------------------------------------------------------- */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION                 */}
      {/* ------------------------------------------------------------- */}
      <LandingFaq />

      {/* ------------------------------------------------------------- */}
      {/* 9. STANDALONE MINIMAL FOOTER                                  */}
      {/* ------------------------------------------------------------- */}
      <LandingFooter
        appSetting={appSetting}
        productSlug={product.slug}
      />

      {/* ------------------------------------------------------------- */}
      {/* 10. STICKY MOBILE BOTTOM BAR (PRICE + 1-CLICK ORDER)          */}
      {/* ------------------------------------------------------------- */}
      <LandingStickyMobileBar
        offerPrice={offerPrice}
        phone={phone}
        waUrl={waUrl}
        onScrollToOrder={scrollToOrder}
      />
    </div>
  );
}
