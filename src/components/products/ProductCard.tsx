'use client';
import { IProduct } from "@/redux/service/products/type";
import { ArrowRight, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CURRENCY } from "@/lib/envSecret";
import { cn } from "@/lib/utils";
import { ICartItem } from "@/redux/service/orders/type";
import { useAppDispatch } from "@/hooks/hooks";
import { addToCart } from "@/redux/features/cartSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import findProductImage from "@/hooks/useFindProductImage";
import { getPriceRange, getSingleProductPrice } from "@/hooks/useGerPrice";
import { showTwoDecimals } from "@/lib/helpers";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  product: IProduct;
};

const ProductCard = ({ product }: Props) => {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    name,
    slug,
    productType,
    gallery,
    variations,
    ratingsAverage,
    totalReviews,
    brand
  } = product || {};

  // Find product image
  const productImage = findProductImage({ product });
  // Calculate price
  const singleProductPrice = getSingleProductPrice(product);
  const productPrice = getPriceRange(product);

  const handleAddToCart = (action: 'cart' | 'buy' = 'cart', e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (product.productType !== 'single' && product.selectedAttributes && product.selectedAttributes.length > 0) {
      router.push(`/products/${product?.slug}`);
      return;
    }

    const sku = 'N/A';
    const cartItem: ICartItem = {
      productId: product.id,
      productName: product.name,
      productSlug: product?.slug,
      sku: sku || 'N/A',
      quantity: 1,
      productType: 'single',
      price: (singleProductPrice?.price || 0),
      salePrice: (singleProductPrice?.finalPrice || 0),
      productImage: productImage,
      freeShipping: Boolean(product?.isFreeShipping)
    };

    dispatch(addToCart({ cart: cartItem }));

    if (action === 'buy') {
      router.push(`/checkout`);
      return;
    }

    toast.success(t["added-to-cart-success"] || "পণ্যটি কার্টে যোগ করা হয়েছে");
  };

  const getOfferAmount = (): number => {
    let discount = 0;
    if (productType === "single") {
      const price = singleProductPrice?.price || 0;
      const finalPrice = singleProductPrice?.finalPrice || 0;
      discount = price - finalPrice;
    } else if (productType === 'variant') {
      if (variations?.length) {
        const offerVariant = variations.find(
          (variant) => (variant?.offerPriceFixed ?? 0) > 0
        );
        if (offerVariant) {
          discount = offerVariant.offerPriceFixed ?? 0;
        }
      }
    }
    return discount > 0 ? discount : 0;
  };

  const getDiscountPercentage = (): number => {
    if (productType === "single") {
      const regular = singleProductPrice?.price || 0;
      const finalPrice = singleProductPrice?.finalPrice || 0;
      if (regular > finalPrice && regular > 0) {
        return Math.round(((regular - finalPrice) / regular) * 100);
      }
    }
    return 0;
  };

  const getHoverImage = () => {
    if (gallery?.length > 1 && gallery[1]) {
      return gallery[1];
    }
    if (variations?.length) {
      for (const variant of variations) {
        if (variant?.images && variant.images.length > 1 && variant.images[1]) {
          return variant.images[1];
        }
        if (variant?.images?.length && variant.images[0]) {
          return variant.images[0];
        }
      }
    }
    return findProductImage({ product });
  };

  const hoverImage = getHoverImage();
  const isStockOut = (product.stock ?? 0) === 0;
  const discountAmount = getOfferAmount();
  const discountPercent = getDiscountPercentage();

  // Brand name or fallback
  const brandName = brand?.name || 'No Brand';

  return (
    <div className="group relative bg-white border border-slate-200 hover:border-orange-400 rounded-xl overflow-hidden p-2 flex flex-col justify-between transition-all duration-300 h-full">
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {discountPercent > 0 ? (
          <span className="bg-rose-500 text-white font-bold text-[10px] md:text-xs px-2 py-0.5 rounded-md">
            {discountPercent}% OFF
          </span>
        ) : discountAmount > 0 ? (
          <span className="bg-rose-500 text-white font-bold text-[10px] md:text-xs px-2 py-0.5 rounded-md">
            ৳{discountAmount} {t["discount-text"] || "ছাড়"}
          </span>
        ) : <span />}

        {isStockOut && (
          <span className="bg-slate-900/80 text-white text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
            {t["out-of-stock"] || "স্টক আউট"}
          </span>
        )}
      </div>

      {/* Product Image */}
      <div>
        <Link href={`/products/${slug}`} className="block relative aspect-square w-full rounded-lg overflow-hidden bg-slate-50 mb-2.5">
          {productImage && (
            <>
              <Image
                width={500}
                height={500}
                src={productImage}
                alt={name || "Product"}
                className={cn(
                  "absolute inset-0 w-full h-full rounded-lg object-cover p-1 transition-all duration-500",
                  hoverImage && hoverImage !== productImage ? "group-hover:opacity-0 scale-100 group-hover:scale-105" : "group-hover:scale-105"
                )}
              />
              {hoverImage && hoverImage !== productImage && (
                <Image
                  width={500}
                  height={500}
                  src={hoverImage}
                  alt={name || "Product Hover"}
                  className="absolute inset-0 w-full h-full rounded-lg object-cover p-1 transition-all duration-500 opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100"
                />
              )}
            </>
          )}

          {isStockOut && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-white text-slate-900 text-xs font-bold px-3 py-1 rounded border border-slate-200">
                স্টক নেই
              </span>
            </div>
          )}
        </Link>

        {/* Brand Tag */}
        <div className="px-0.5 mb-1 flex items-center justify-between">
          <span className="text-[11px] md:text-xs font-medium text-orange-500 capitalize line-clamp-1">
            {brandName}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{ratingsAverage ? Number(ratingsAverage).toFixed(1) : "5.0"}</span>
            <span className="text-slate-300">|</span>
            <span className="text-[10px] text-slate-400">{totalReviews || 0}</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/products/${slug}`} className="block px-0.5">
          <h3 className="text-xs md:text-sm font-semibold text-slate-800 hover:text-orange-600 line-clamp-2 md:line-clamp-1 transition-colors leading-snug">
            {name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="px-0.5 mt-2 mb-3 flex items-baseline gap-1.5 flex-wrap">
          {productType === 'single' ? (
            <>
              <span className="text-base md:text-lg font-bold text-rose-600">
                {CURRENCY}{showTwoDecimals(singleProductPrice?.finalPrice || 0)}
              </span>
              {discountAmount > 0 && (
                <del className="text-xs md:text-sm text-slate-400 font-normal">
                  {CURRENCY}{showTwoDecimals(singleProductPrice?.price || 0)}
                </del>
              )}
            </>
          ) : (
            <span className="text-base md:text-lg font-bold text-rose-600">
              {productPrice}
            </span>
          )}

          {productType === "variant" && variations && variations.length > 0 && (
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
              {variations.length} ভ্যারিয়েন্ট
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 pt-1 mt-auto">
        {/* Cart Icon Button */}
        <button
          type="button"
          disabled={isStockOut}
          onClick={(e) => handleAddToCart('cart', e)}
          title={t["add-to-cart"] || "কার্টে যোগ করুন"}
          className="h-9 w-9 rounded-lg border border-orange-400 text-orange-500 hover:bg-orange-50 active:bg-orange-100 flex items-center justify-center transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>

        {/* Buy Now Button */}
        <button
          type="button"
          disabled={isStockOut}
          onClick={(e) => handleAddToCart('buy', e)}
          className="flex-1 h-9 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:opacity-95 text-white font-medium text-xs md:text-sm rounded-lg flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>{t["buy-now"] || "এখনই কিনুন"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
