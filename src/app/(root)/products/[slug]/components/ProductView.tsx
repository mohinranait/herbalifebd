'use client';

import { useAppDispatch } from '@/hooks/hooks';
import { addToCart } from '@/redux/features/cartSlice';
import { ICartItem } from '@/redux/service/orders/type';
import { IProduct, IProductVariant } from '@/redux/service/products/type';
import { useGetAppSettingQuery } from '@/redux/service/setting';

import React, { useState } from 'react';
import ImageGallary from './image-gallary';
import {
  Building2,
  MessageSquare,
  Minus,
  Phone,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { CURRENCY } from '@/lib/envSecret';
import RequestQuote from './RequestQuote';
import VideoSection from './VideoSection';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ViewHTML from '@/components/shared/html-viewer/HTMLView';
import StarRating from '@/components/shared/StarRating';
import { formatDistanceToNow } from 'date-fns';
import { useGetCommentByProductIdQuery } from '@/redux/service/comments';
import { useTranslation } from '@/hooks/useTranslation';

type Props = {
  product: IProduct;
};

const ProductView = ({ product }: Props) => {
  const t = useTranslation();
  const router = useRouter();
  const { data: appSetting } = useGetAppSettingQuery();
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const { data: getComments } = useGetCommentByProductIdQuery(
    { productId: product?.id || '1', params: 'accessMode=public' },
    { skip: !product?.id }
  );
  const reviews = getComments?.data || [];

  const isVariant = product.productType === 'variant';

  // ---------------------------------------------------------------------------
  // ATTRIBUTE GROUPS DERIVATION
  // ---------------------------------------------------------------------------
  // Extracts attribute groups from product.selectedAttributes or infers them
  // dynamically from variation names (e.g., "Lemon Flavor (50g)", "Red / M", etc.)
  interface IAttrGroup {
    name: string;
    values: string[];
  }

  const attributeGroups = React.useMemo<IAttrGroup[]>(() => {
    // 1. Explicit selectedAttributes from product configuration
    if (product.selectedAttributes && product.selectedAttributes.length > 0) {
      const explicit = product.selectedAttributes
        .filter((attr) => attr.name && attr.selectedValues && attr.selectedValues.length > 0)
        .map((attr) => ({
          name: attr.name,
          values: attr.selectedValues,
        }));
      if (explicit.length > 0) return explicit;
    }

    // 2. Derive dynamically from variations if it is a variant product
    if (isVariant && product.variations && product.variations.length > 0) {
      const varNames = product.variations.map((v) => (v.name || '').trim()).filter(Boolean);
      if (varNames.length === 0) return [];

      // Pattern A: "Val1 / Val2" (Standard delimiter)
      if (varNames.some((n) => n.includes(' / '))) {
        const partsCount = Math.max(...varNames.map((n) => n.split(' / ').length));
        const groups: IAttrGroup[] = [];

        for (let i = 0; i < partsCount; i++) {
          const values: string[] = [];
          varNames.forEach((name) => {
            const parts = name.split(' / ');
            const val = parts[i]?.trim();
            if (val && !values.includes(val)) values.push(val);
          });

          let groupName = `Option ${i + 1}`;
          if (partsCount === 2) {
            groupName = i === 0 ? 'Color (কালার)' : 'Size (সাইজ)';
          }
          groups.push({ name: groupName, values });
        }
        return groups;
      }

      // Pattern B: "Name (Detail)" e.g. "Lemon Flavor (50g)", "Original Flavor (100g)"
      const parenRegex = /^(.+?)\s*\((.+?)\)$/;
      const allMatchParen = varNames.every((n) => parenRegex.test(n));

      if (allMatchParen) {
        const part1Values: string[] = [];
        const part2Values: string[] = [];

        varNames.forEach((name) => {
          const match = name.match(parenRegex);
          if (match) {
            const p1 = match[1].trim();
            const p2 = match[2].trim();
            if (!part1Values.includes(p1)) part1Values.push(p1);
            if (!part2Values.includes(p2)) part2Values.push(p2);
          }
        });

        const isWeightOrSize = part2Values.some((v) =>
          /\b(g|kg|ml|l|oz|pcs|packet|size|s|m|xl|xxl)\b/i.test(v)
        );
        const group2Name = isWeightOrSize ? 'Size / Weight (সাইজ / ওজন)' : 'Size (সাইজ)';
        const group1Name = 'Flavor / Type (ফ্লেভার / টাইপ)';

        return [
          { name: group1Name, values: part1Values },
          { name: group2Name, values: part2Values },
        ];
      }

      // Pattern C: Flat variation list (single attribute)
      const allVals = Array.from(new Set(varNames));
      return [{ name: 'ভ্যারিয়েন্ট (Variant)', values: allVals }];
    }

    return [];
  }, [product.selectedAttributes, isVariant, product.variations]);

  // Helper to extract attribute map for a given variation
  const getAttributesForVariation = React.useCallback(
    (variation: IProductVariant | null): Record<string, string> => {
      if (!variation || attributeGroups.length === 0) return {};
      const result: Record<string, string> = {};
      const varName = (variation.name || '').trim();

      if (varName.includes(' / ')) {
        const parts = varName.split(' / ');
        attributeGroups.forEach((g, idx) => {
          result[g.name] = parts[idx]?.trim() || g.values[0] || '';
        });
        return result;
      }

      const parenRegex = /^(.+?)\s*\((.+?)\)$/;
      const match = varName.match(parenRegex);
      if (match && attributeGroups.length === 2) {
        result[attributeGroups[0].name] = match[1].trim();
        result[attributeGroups[1].name] = match[2].trim();
        return result;
      }

      if (attributeGroups.length === 1) {
        result[attributeGroups[0].name] = varName;
        return result;
      }

      attributeGroups.forEach((g) => {
        const found = g.values.find((val) => varName.includes(val));
        result[g.name] = found || g.values[0] || '';
      });

      return result;
    },
    [attributeGroups]
  );

  // Selected variation state (defaults to first variation if variant product)
  const [selectedVariation, setSelectedVariation] = useState<IProductVariant | null>(
    isVariant && product.variations && product.variations.length > 0 ? product.variations[0] : null
  );

  // Initial selected attributes state
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    if (isVariant && product.variations && product.variations.length > 0) {
      return getAttributesForVariation(product.variations[0]);
    }
    if (product.selectedAttributes && product.selectedAttributes.length > 0) {
      const defaults: Record<string, string> = {};
      product.selectedAttributes.forEach((attr) => {
        if (attr.name && attr.selectedValues?.[0]) {
          defaults[attr.name] = attr.selectedValues[0];
        }
      });
      return defaults;
    }
    return {};
  });

  // Keep selectedAttributes in sync if attributeGroups load/change
  React.useEffect(() => {
    if (attributeGroups.length > 0) {
      setSelectedAttributes((prev) => {
        let hasChanges = false;
        const next = { ...prev };
        attributeGroups.forEach((g) => {
          if (!next[g.name] || !g.values.includes(next[g.name])) {
            next[g.name] = g.values[0] || '';
            hasChanges = true;
          }
        });
        return hasChanges ? next : prev;
      });
    }
  }, [attributeGroups]);

  // Helper to find variation from selected attributes map
  const findVariationForAttributes = React.useCallback(
    (attrs: Record<string, string>): IProductVariant | null => {
      if (!product.variations || product.variations.length === 0) return null;

      // 1. Check exact "val1 / val2"
      const slashCombo = attributeGroups.map((g) => attrs[g.name]).filter(Boolean).join(' / ');
      const matchSlash = product.variations.find((v) => (v.name || '').trim() === slashCombo);
      if (matchSlash) return matchSlash;

      // 2. Check "val1 (val2)"
      if (attributeGroups.length === 2) {
        const parenCombo = `${attrs[attributeGroups[0].name]} (${attrs[attributeGroups[1].name]})`;
        const matchParen = product.variations.find((v) => (v.name || '').trim() === parenCombo);
        if (matchParen) return matchParen;
      }

      // 3. Check variation containing all selected values
      const attrVals = Object.values(attrs).filter(Boolean);
      const matchAll = product.variations.find((v) =>
        attrVals.every((val) => (v.name || '').includes(val))
      );
      if (matchAll) return matchAll;

      // 4. Check variation containing any selected value
      const matchSome = product.variations.find((v) =>
        attrVals.some((val) => (v.name || '').includes(val))
      );
      if (matchSome) return matchSome;

      return product.variations[0];
    },
    [product.variations, attributeGroups]
  );

  // Handle clicking on an attribute option
  const handleSelectAttribute = (groupName: string, value: string) => {
    const updated = {
      ...selectedAttributes,
      [groupName]: value,
    };

    if (isVariant && product.variations && product.variations.length > 0) {
      // Find matching variation
      let matchingVar = findVariationForAttributes(updated);

      // If the exact combination doesn't exist, search for variation matching this value
      if (!matchingVar || !(matchingVar.name || '').includes(value)) {
        const altVar = product.variations.find((v) => (v.name || '').includes(value));
        if (altVar) {
          matchingVar = altVar;
        }
      }

      if (matchingVar) {
        setSelectedVariation(matchingVar);
        const resolvedAttrs = getAttributesForVariation(matchingVar);
        setSelectedAttributes(resolvedAttrs);
      } else {
        setSelectedAttributes(updated);
      }
    } else {
      setSelectedAttributes(updated);
    }
  };

  const currentVariation = selectedVariation || (isVariant ? product.variations?.[0] : null);

  const price = isVariant
    ? currentVariation?.price || 0
    : product.price || 0;

  const offerPrice = isVariant
    ? (currentVariation?.price || 0) - (currentVariation?.offerPriceFixed || 0) || 0
    : (product?.price || 0) - (product?.discountPrice || 0) || 0;

  const discountPercent = isVariant
    ? currentVariation?.offerPriceParcent || 0
    : product.discountParcent || 0;

  const stock = isVariant
    ? currentVariation?.stock || 0
    : product.stock || 0;

  const images = React.useMemo(() => {
    const list: string[] = [];
    if (isVariant && currentVariation?.images && currentVariation.images.length > 0) {
      currentVariation.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    if (product.gallery && product.gallery.length > 0) {
      product.gallery.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    if (product.thumbnail && !list.includes(product.thumbnail)) {
      list.push(product.thumbnail);
    }
    return list.length > 0 ? list : product.gallery || [];
  }, [isVariant, currentVariation, product.gallery, product.thumbnail]);

  const areAllAttributesSelected = () => {
    if (attributeGroups.length > 0) {
      return attributeGroups.every((g) => Boolean(selectedAttributes[g.name]));
    }
    if (isVariant) {
      return Boolean(currentVariation);
    }
    return true;
  };

  const handleAddToCart = (action: 'cart' | 'order' = 'cart') => {
    if (stock <= 0) {
      toast.error('দুঃখিত, এই পণ্যটি বর্তমানে স্টকে নেই');
      return;
    }

    if (!areAllAttributesSelected()) {
      toast.error('অনুগ্রহ করে ভ্যারিয়েন্ট সিলেক্ট করুন');
      return;
    }

    const sku = isVariant ? (currentVariation?.sku || 'N/A') : 'N/A';

    const selectedVariantsObj: Record<string, string> = { ...selectedAttributes };
    if (isVariant && currentVariation) {
      selectedVariantsObj['Option'] = currentVariation.name;
    }

    const cartItem: ICartItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product?.slug,
      sku: sku || 'N/A',
      quantity: quantity,
      price: price,
      productType: product.productType,
      salePrice: offerPrice,
      productImage: images[0],
      selectedVariants: Object.keys(selectedVariantsObj).length > 0 ? selectedVariantsObj : undefined,
      variationId: currentVariation?.id || null,
      freeShipping: Boolean(product?.isFreeShipping),
    };

    dispatch(addToCart({ cart: cartItem }));

    if (action === 'order') {
      router.push('/checkout');
    } else {
      toast.success('পণ্যটি সফলভাবে কার্টে যোগ করা হয়েছে!', {
        description: isVariant && currentVariation ? `${product.name} (${currentVariation.name})` : product.name,
        action: {
          label: 'কার্ট দেখুন',
          onClick: () => router.push('/cart'),
        },
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('লিংক কপি করা হয়েছে!');
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : product.ratingsAverage || 0;

  const ratings = [5, 4, 3, 2, 1].map((star) => {
    const totalReviews = reviews.filter((st) => st.rating === star).length;
    return {
      label: star,
      width: reviews.length > 0 ? (totalReviews / reviews.length) * 100 : 0,
      reviews: totalReviews,
    };
  });

  const formateDateRevalidate = (date: string) => {
    try {
      const formate = new Date(date);
      return formatDistanceToNow(formate, { addSuffix: true });
    } catch {
      return '';
    }
  };

  // Dynamic Shipping Zones from settings (handles any number of areas gracefully)
  const shippingZones =
    appSetting?.shipping?.shippingZones && appSetting.shipping.shippingZones.length > 0
      ? appSetting.shipping.shippingZones
      : [
          { areaName: 'ঢাকার ভিতরে', fee: 60 },
          { areaName: 'ঢাকার বাহিরে', fee: 120 },
        ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
      {/* --------------------------------------------------------------------- */}
      {/* LEFT COLUMN: STICKY PRODUCT IMAGE GALLERY                             */}
      {/* --------------------------------------------------------------------- */}
      <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
        <ImageGallary product={product} images={images} stock={stock} />
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* RIGHT COLUMN: SCROLLABLE INFO, ACTIONS, DYNAMIC ZONES & TABS          */}
      {/* --------------------------------------------------------------------- */}
      <div className="lg:col-span-7 space-y-4">
        {/* Brand Tag & SKU */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-semibold text-[#d97706]">
            {product.brand?.name || 'No Brand'}
          </span>
          {currentVariation?.sku && (
            <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              SKU: {currentVariation.sku}
            </span>
          )}
        </div>

        {/* Product Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-snug tracking-tight">
          {product.name}
        </h1>

        {/* Ratings, Questions & Share Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 py-1">
          <div className="flex items-center text-amber-400 gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.ratingsAverage || 5)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-200 text-slate-300'
                }`}
              />
            ))}
          </div>

          <span className="font-semibold text-slate-700">
            {product.ratingsAverage ? product.ratingsAverage.toFixed(1) : '5.0'}
          </span>

          <span className="text-slate-300">|</span>

          <span>{product.totalReviews || 0} রেটিং</span>

          <span className="text-slate-300">|</span>

          <span className="inline-flex items-center gap-1 text-[#00afc7]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>0 প্রশ্ন ও উত্তর</span>
          </span>

          <span className="text-slate-300">|</span>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-[#ff7a00] cursor-pointer transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>শেয়ার করুন</span>
          </button>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* PRICE ROW (Clean Sokherhut layout)                                */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex items-baseline gap-2.5 pt-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {CURRENCY} {offerPrice.toLocaleString()}
          </span>

          {price > offerPrice && (
            <>
              <del className="text-base sm:text-lg text-slate-400 font-normal">
                {CURRENCY} {price.toLocaleString()}
              </del>

              {discountPercent > 0 && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#ff3b30] text-white">
                  {Math.round(discountPercent)}% OFF
                </span>
              )}
            </>
          )}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* ATTRIBUTE SELECTORS (Color, Size, Flavor, Weight, etc.)           */}
        {/* ----------------------------------------------------------------- */}
        {attributeGroups.length > 0 && (
          <div className="space-y-3.5 pt-2">
            {attributeGroups.map((group) => {
              const currentValue = selectedAttributes[group.name] || group.values[0];

              return (
                <div key={group.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {group.name}:
                    </span>
                    {currentValue && (
                      <span className="text-xs font-bold text-[#ff7a00]">
                        {currentValue}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {group.values.map((val) => {
                      const isSelected = currentValue === val;

                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleSelectAttribute(group.name, val)}
                          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all border cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-[#ff7a00] text-[#ff7a00] bg-orange-50/70 ring-2 ring-[#ff7a00]/30 font-bold'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span>{val}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fallback for flat variant products without attributes */}
        {attributeGroups.length === 0 && isVariant && product.variations && product.variations.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                ভ্যারিয়েন্ট নির্বাচন করুন:
              </span>
              {currentVariation && (
                <span className="text-xs font-bold text-[#ff7a00]">
                  {currentVariation.name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {product.variations.map((v) => {
                const isSelected = currentVariation?.name === v.name;
                const vOffer = (v.price || 0) - (v.offerPriceFixed || 0);

                return (
                  <button
                    key={v.id || v.name}
                    type="button"
                    onClick={() => setSelectedVariation(v)}
                    className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all border cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'border-[#ff7a00] text-[#ff7a00] bg-orange-50/60 ring-2 ring-[#ff7a00]/30 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span>{v.name}</span>
                    {vOffer > 0 && (
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-[#ff7a00]' : 'text-slate-500'}`}>
                        ({CURRENCY}{vOffer.toLocaleString()})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* QUANTITY SELECTOR                                                 */}
        {/* ----------------------------------------------------------------- */}
        {stock > 0 && (
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-semibold text-slate-700">পরিমাণ:</span>

            <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="w-10 text-center text-xs font-bold text-slate-900">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                disabled={quantity >= stock}
                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-xs text-slate-500">
              ({stock > 10 ? 'স্টকে আছে' : `মাত্র ${stock} টি বাকি`})
            </span>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ACTION BUTTONS (Placed below quantity, above delivery card)       */}
        {/* ----------------------------------------------------------------- */}
        <div className="pt-2 space-y-2.5">
          <div className="grid grid-cols-2 gap-3">
            {/* Cart Button (Teal / Cyan) */}
            <button
              type="button"
              onClick={() => handleAddToCart('cart')}
              disabled={stock === 0 || !areAllAttributesSelected()}
              className="w-full h-11 sm:h-12 rounded-lg font-bold text-xs sm:text-sm md:text-base text-white bg-[#00afc7] hover:bg-[#009bb0] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{t["add-to-cart"] || "কার্টে রাখুন"}</span>
            </button>

            {/* Buy Now Button (Vibrant Orange) */}
            <button
              type="button"
              onClick={() => handleAddToCart('order')}
              disabled={stock === 0 || !areAllAttributesSelected()}
              className="w-full h-11 sm:h-12 rounded-lg font-bold text-xs sm:text-sm md:text-base text-white bg-[#ff7a00] hover:bg-[#e66e00] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>{t["buy-now"] || "এখনই কিনুন"}</span>
            </button>
          </div>

          {/* Hotline Call Box */}
          <div className="text-center pt-1 text-xs sm:text-sm text-slate-700 flex flex-wrap items-center justify-center gap-2 font-medium">
            <span className="font-semibold text-slate-800">{t["call-now-label"] || "কল করুন"}</span>
            <a
              href="tel:01602094399"
              className="inline-flex items-center gap-1 text-[#ff7a00] font-bold hover:underline"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>01602094399</span>
            </a>
            <span className="text-slate-400">{t["or-text"] || "অথবা"}</span>
            <a
              href="tel:01315118595"
              className="inline-flex items-center gap-1 text-[#ff7a00] font-bold hover:underline"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>01315118595</span>
            </a>
          </div>

          {/* Request Quote Option */}
          <div className="pt-0.5">
            <RequestQuote
              image={images[0] || product?.gallery?.[0]}
              title={product?.name}
              productId={product?.id}
              sku={currentVariation?.sku ?? undefined}
              price={offerPrice}
            />
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* DYNAMIC DELIVERY CHARGES & TRUST BOX (Handles any number of areas)*/}
        {/* ----------------------------------------------------------------- */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white my-4">
          {/* Header */}
          <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#ff7a00]" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                ডেলিভারি চার্জ ও এরিয়া
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              {shippingZones.length} টি এলাকা
            </span>
          </div>

          {/* Free Shipping Highlight if applicable */}
          {product?.isFreeShipping && (
            <div className="mx-4 mt-3 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>এই পণ্যটিতে ডেলিভারি সম্পূর্ণ ফ্রি!</span>
            </div>
          )}

          {/* Dynamic Delivery Areas List (Scrollable if more than 4 areas) */}
          <div className={`p-3.5 ${shippingZones.length > 4 ? 'max-h-52 overflow-y-auto pr-2' : ''}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {shippingZones.map((zone, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-700 truncate" title={zone.areaName}>
                      {zone.areaName}
                    </span>
                  </div>
                  <span className="text-xs font-bold shrink-0">
                    {zone.fee === 0 ? (
                      <span className="text-emerald-600 font-bold">ফ্রি</span>
                    ) : (
                      <span className="text-slate-900">{CURRENCY} {zone.fee.toLocaleString()}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-medium text-slate-800">সারাদেশ এ ক্যাশ অন ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-medium text-slate-800">নিরাপদ পেমেন্ট করার সহজ মাধ্যম</span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* TABS (Product Details, Rating & Reviews, Q&A)                      */}
        {/* ----------------------------------------------------------------- */}
        <div className="border-b border-slate-200 flex items-center gap-6 text-sm font-semibold pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-b-2 border-[#00afc7] text-[#00afc7] font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t["product-description-tab"] || "প্রডাক্টের বিবরণ"}
          </button>

          {appSetting?.features?.review && (
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`pb-2.5 transition-colors cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-[#00afc7] text-[#00afc7] font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t["ratings-and-reviews"] || "রেটিং ও রিভিউ"} ({reviews?.length || 0})
            </button>
          )}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* TAB CONTENT                                                       */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'details' ? (
          <div className="pt-2 text-slate-700 leading-relaxed text-sm sm:text-base space-y-3">
            {product?.description ? (
              <ViewHTML htmlText={product.description} />
            ) : product?.shortDescription ? (
              <p>{product.shortDescription}</p>
            ) : (
              <p className="text-slate-500 text-sm">কোন বিস্তারিত তথ্য পাওয়া যায়নি।</p>
            )}

            {product?.videoUrl && (
              <div className="pt-4">
                <h4 className="font-bold text-slate-900 mb-2">ভিডিও রিভিউ:</h4>
                <VideoSection url={product.videoUrl} />
              </div>
            )}
          </div>
        ) : (
          <div className="pt-3 space-y-5">
            {/* Rating Breakdown */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-center sm:pr-6 sm:border-r border-slate-200 shrink-0">
                <div className="text-4xl font-extrabold text-slate-900">
                  {avgRating.toFixed(1)}
                  <span className="text-base text-slate-400 font-normal">/5</span>
                </div>
                <div className="flex items-center justify-center my-1">
                  <StarRating value={avgRating} />
                </div>
                <p className="text-xs text-slate-500">{reviews.length} টি রিভিউ</p>
              </div>

              <div className="flex-1 w-full space-y-1.5">
                {ratings.map((star) => (
                  <div key={star.label} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-slate-600 font-medium">{star.label} স্টার</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${star.width}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-slate-400">{star.reviews}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            {reviews && reviews.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {reviews.map((rev, index) => (
                  <div key={index} className="py-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-800">
                        {rev?.userId?.name || 'ক্রেতা'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {rev?.createdAt ? formateDateRevalidate(rev.createdAt) : ''}
                      </span>
                    </div>
                    <StarRating size={12} value={rev?.rating} />
                    <p className="text-xs sm:text-sm text-slate-600 pt-1 leading-relaxed">
                      {rev?.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                এখনো কোনো রিভিউ পাওয়া যায়নি
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductView;
