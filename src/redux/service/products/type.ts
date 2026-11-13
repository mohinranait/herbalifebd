import { IMetaPagination } from "@/types/common.type";

// These types mirror the `Product` / `ProductVariation` models of
// src/prisma/contract.prisma: API responses are the database rows as they are.

export interface IProductSelectedVariant {
  attributeId: string;
  name: string;
  selectedValues: string[];
}

export interface IProductVariant {
  id: string;
  productId?: string;
  name: string;
  price?: number | null;
  offerPriceFixed?: number | null;
  offerPriceParcent?: number | null;
  costPrice?: number | null;
  sku?: string | null;
  barcode?: string | null;
  stock?: number | null;
  lowStockAlert?: number | null;
  images?: string[] | null;
  attributeConfig?: Record<string, string> | null;
  weight?: number | null;
  dimensionLength?: number | null;
  dimensionWidth?: number | null;
  dimensionHeight?: number | null;
  isDefault?: boolean | null;
}

export type TProductType = "variant" | "single";

/** The category / brand loaded with a product (`.include("category")`, `.include("brand")`). */
export interface IProductCategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface IProductBrandRef {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface IProduct {
  id: string;
  name: string;
  slug: string;
  videoUrl?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  gallery: string[];

  price?: number | null;
  discountPrice?: number | null;
  discountParcent?: number | null;
  costPrice?: number | null;

  productType: TProductType;
  selectedAttributes?: IProductSelectedVariant[] | null;

  categoryId?: string | null;
  category?: IProductCategoryRef | null;
  brandId?: string | null;
  brand?: IProductBrandRef | null;

  stock?: number | null;
  trackStock?: boolean | null;

  weight?: number | null;
  dimensionLength?: number | null;
  dimensionWidth?: number | null;
  dimensionHeight?: number | null;
  isFreeShipping?: boolean | null;

  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[] | null;

  ratingsAverage?: number | null;
  totalReviews?: number | null;

  tags?: string[] | null;
  isFeatured?: boolean | null;
  totalSold?: number | null;
  isDelete?: boolean | null;
  status?: boolean | null;

  variations?: IProductVariant[] | null;

  createdAt: string;
  updatedAt: string;
}

export interface IProductListResponse {
  success: boolean;
  data: IProduct[];
  message?: string;
  meta: IMetaPagination;
}

export interface IProductDetailsResponse {
  data: IProduct;
}
