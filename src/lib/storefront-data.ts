import { unstable_cache } from "next/cache";
import { cache } from "react";
import { db } from "@/prisma/db";
import { ICategory } from "@/redux/service/categories/type";
import { IBrand } from "@/redux/service/brand/type";
import { ISlider } from "@/redux/service/sliders/type";
import {
  IProduct,
  IProductCategoryRef,
  IProductBrandRef,
} from "@/redux/service/products/type";
import { IAppSettings } from "@/models/app-setting";
import { IMetaPagination } from "@/types/common.type";

/* -------------------------------------------------------------------------- */
/*                                Types & Models                               */
/* -------------------------------------------------------------------------- */

export interface IStorefrontListResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  meta: IMetaPagination;
}

export interface ICategoryWithCount extends ICategory {
  totalProducts: number;
}

export interface ICategoryIndexItem {
  id: string;
  name: string;
  slug: string;
}

export interface IBrandIndexItem {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface IBrandCategoryItem {
  id: string;
  name: string;
  logo?: string | null;
}

export interface IBrandsByCategoryResponse {
  success: boolean;
  data: IBrandCategoryItem[];
}

export interface IProductCommentUser {
  id: string;
  name: string;
}

export interface IProductCommentItem {
  id: string;
  comment: string;
  rating: number;
  isApproved: boolean;
  isFeature: boolean;
  productId: string;
  userId: IProductCommentUser | string;
  user?: IProductCommentUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface IProductCommentsResponse {
  success: boolean;
  message: string;
  data: IProductCommentItem[];
}

export type ProductListParams = {
  type?: string;
  category?: string | null;
  search?: string | null;
  page?: number;
  limit?: number;
};

export type ProductFilterParams = {
  search?: string | null;
  category?: string | null;
  brand?: string | null;
  minPrice?: number | string | null;
  maxPrice?: number | string | null;
  minRating?: number | string | null;
  sort?: string | null;
  page?: number;
  limit?: number;
};

type QueryFieldExpr = {
  asc: () => unknown;
  desc: () => unknown;
  contains: (value: unknown) => unknown;
  in: (values: unknown[]) => unknown;
  gt: (value: unknown) => unknown;
  gte: (value: unknown) => unknown;
  lt: (value: unknown) => unknown;
  lte: (value: unknown) => unknown;
  isNotNull: () => unknown;
  isNull: () => unknown;
  [key: string]: unknown;
};

type QueryFilterRecord = Record<string, QueryFieldExpr>;

type PrismaCollectionQuery = {
  where: (...args: unknown[]) => PrismaCollectionQuery;
  orderBy: (...args: unknown[]) => PrismaCollectionQuery;
  select: (...fields: string[]) => PrismaCollectionQuery;
  include: (...args: unknown[]) => PrismaCollectionQuery;
  offset: (count: number) => PrismaCollectionQuery;
  limit: (count: number) => PrismaCollectionQuery;
  count: () => Promise<number>;
  all: () => Promise<unknown[]>;
  first: () => Promise<unknown | null>;
};

interface CategoryProductRef {
  categoryId: string | null;
}

interface ProductWithBrandRef {
  brandId: string;
  brand: IBrand | null;
}

interface CommentDbRow {
  id: string;
  comment: string;
  rating: number;
  isApproved: boolean;
  isFeature: boolean;
  productId: string;
  userId: string;
  user?: IProductCommentUser | null;
  createdAt: string;
  updatedAt: string;
}

type ProductCardDbRow = Omit<IProduct, "category" | "brand">;

/* -------------------------------------------------------------------------- */
/*                     Storefront data: one cached read layer                  */
/* -------------------------------------------------------------------------- */
// Everything the public pages show is read here, straight from the database
// (no HTTP hop to our own API) and kept in the Next.js data cache.
//
// Freshness: every write made through `db` expires the matching tags (see
// COLLECTION_CACHE_TAGS in src/prisma/db.ts), so admin changes show up on the
// next request. REVALIDATE_SECONDS is only a safety net for changes made
// outside the app (seed script, a database GUI).

const REVALIDATE_SECONDS = 300;

// Part of every cache key. Bump it whenever the shape of the cached data changes,
// so entries written by an older version of the code are never served.
const CACHE_VERSION = "v2";

const TAG = {
  products: "sf:products",
  categories: "sf:categories",
  brands: "sf:brands",
  sliders: "sf:sliders",
  setting: "sf:setting",
  comments: "sf:comments",
} as const;

/** Dates / ObjectIds to plain JSON, so a cache hit and a cache miss look the same. */
const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value));

function cached<A extends unknown[], R>(
  name: string,
  tags: string[],
  fn: (...args: A) => Promise<R>
) {
  // unstable_cache = shared across requests; cache() = shared within one render
  return cache(
    unstable_cache(fn, ["storefront", CACHE_VERSION, name], { tags, revalidate: REVALIDATE_SECONDS })
  );
}

/** A page should still render (with a fallback) when one read fails. Failures are never cached. */
export async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error("Storefront data error:", error);
    return fallback;
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Settings                                   */
/* -------------------------------------------------------------------------- */

export const getSettings = cached("settings", [TAG.setting], async (): Promise<IAppSettings | null> => {
  const settings = await db.orm.public.AppSetting.first();
  return settings ? plain(settings as IAppSettings) : null;
});

/* -------------------------------------------------------------------------- */
/*                                 Categories                                  */
/* -------------------------------------------------------------------------- */

/** All active categories (newest first), each with the product count of its whole subtree. */
const getActiveCategories = cached(
  "categories",
  [TAG.categories, TAG.products],
  async (): Promise<ICategoryWithCount[]> => {
    const [categories, activeProducts] = await Promise.all([
      db.orm.public.Category.where({ isDelete: false, status: true })
        .orderBy((c: QueryFilterRecord) => c.createdAt.desc())
        .all() as Promise<ICategory[]>,
      db.orm.public.Product.where({ status: true, isDelete: false })
        .select("categoryId")
        .all() as Promise<CategoryProductRef[]>,
    ]);

    const childrenOf = new Map<string, string[]>();
    for (const node of categories) {
      if (!node.parentId) continue;
      const parentId = String(node.parentId);
      childrenOf.set(parentId, [...(childrenOf.get(parentId) || []), String(node.id)]);
    }

    const directCount = new Map<string, number>();
    for (const product of activeProducts) {
      if (!product.categoryId) continue;
      const categoryId = String(product.categoryId);
      directCount.set(categoryId, (directCount.get(categoryId) || 0) + 1);
    }

    const countWithDescendants = (categoryId: string) => {
      let count = 0;
      const seen = new Set<string>();
      const queue = [categoryId];
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (seen.has(current)) continue; // guards against a parent/child loop
        seen.add(current);
        count += directCount.get(current) || 0;
        queue.push(...(childrenOf.get(current) || []));
      }
      return count;
    };

    const withCount: ICategoryWithCount[] = categories.map((cat) => ({
      ...cat,
      totalProducts: countWithDescendants(String(cat.id)),
    }));

    return plain(withCount);
  }
);

/** Same shape as GET /api/admin/categories?status=true&isDelete=false[&page&limit]. */
export async function getCategoryList(
  options: { page?: number; limit?: number } = {}
): Promise<IStorefrontListResponse<ICategoryWithCount>> {
  const all = await getActiveCategories();
  const page = options.page || 1;
  const limit = options.limit || 10000;
  const data = all.slice((page - 1) * limit, page * limit);

  return {
    success: true,
    message: "Successfull",
    data,
    meta: { total: all.length, page, limit, totalPages: Math.ceil(all.length / limit) || 1 },
  };
}

/** The category itself plus every active sub-category below it (no extra query). */
async function getDescendantCategoryIds(categoryId: string): Promise<string[]> {
  const all = await getActiveCategories();

  const result: string[] = [];
  const seen = new Set<string>();
  const queue: string[] = [categoryId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (seen.has(current)) continue;
    seen.add(current);
    result.push(current);
    for (const cat of all) {
      if (cat.parentId && String(cat.parentId) === current) queue.push(String(cat.id));
    }
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/*                              Sliders and brands                             */
/* -------------------------------------------------------------------------- */

/** Same shape as GET /api/admin/sliders?page=1&limit=10&isDelete=false&status=true. */
export const getSliderList = cached(
  "sliders",
  [TAG.sliders],
  async (limit: number = 10): Promise<IStorefrontListResponse<ISlider>> => {
    const sliders = (await db.orm.public.Slider.where({ status: true, isDelete: false })
      .orderBy([(s: QueryFilterRecord) => s.order.asc(), (s: QueryFilterRecord) => s.createdAt.desc()])
      .all()) as ISlider[];

    return {
      success: true,
      data: plain(sliders.slice(0, limit)),
      meta: { total: sliders.length, page: 1, limit, totalPages: Math.ceil(sliders.length / limit) || 1 },
    };
  }
);

/** Same shape as GET /api/admin/brands?page=1&limit=30&status=true&isDelete=false. */
export const getBrandList = cached(
  "brands",
  [TAG.brands],
  async (limit: number = 30): Promise<IStorefrontListResponse<IBrand>> => {
    const brands = (await db.orm.public.Brand.where({ status: true, isDelete: false })
      .orderBy((b: QueryFilterRecord) => b.createdAt.desc())
      .all()) as IBrand[];

    return {
      success: true,
      message: "Success",
      data: plain(brands.slice(0, limit)),
      meta: { total: brands.length, page: 1, limit, totalPages: Math.ceil(brands.length / limit) || 1 },
    };
  }
);

/* -------------------------------------------------------------------------- */
/*                                Product lists                                */
/* -------------------------------------------------------------------------- */

// What a product card needs. The long HTML description, the SEO fields and the
// cost price stay out of list responses: smaller queries, smaller pages.
const PRODUCT_CARD_FIELDS = [
  "id",
  "name",
  "slug",
  "videoUrl",
  "shortDescription",
  "thumbnail",
  "gallery",
  "price",
  "discountPrice",
  "discountParcent",
  "productType",
  "selectedAttributes",
  "categoryId",
  "brandId",
  "stock",
  "trackStock",
  "weight",
  "isFreeShipping",
  "ratingsAverage",
  "totalReviews",
  "tags",
  "isFeatured",
  "totalSold",
  "isDelete",
  "status",
  "createdAt",
  "updatedAt",
] as const;

const activeProducts = (): PrismaCollectionQuery =>
  db.orm.public.Product.where({ status: true, isDelete: false });

// Category and brand names for the cards come from two tiny cached lookups
// instead of being joined onto every product row: the joined documents (with
// their descriptions and banners) were about half of every list response.
const getCategoryIndex = cached("category-index", [TAG.categories], async (): Promise<ICategoryIndexItem[]> => {
  const rows = (await db.orm.public.Category.select("id", "name", "slug").all()) as ICategoryIndexItem[];
  return plain(rows);
});

const getBrandIndex = cached("brand-index", [TAG.brands], async (): Promise<IBrandIndexItem[]> => {
  const rows = (await db.orm.public.Brand.select("id", "name", "slug", "logo").all()) as IBrandIndexItem[];
  return plain(rows);
});

/** One light query for the products (+ variations), names attached from the cached lookups. */
async function loadCards(query: PrismaCollectionQuery, page: number, limit: number): Promise<IProduct[]> {
  const [products, categories, brands] = await Promise.all([
    query
      .select(...PRODUCT_CARD_FIELDS)
      .include("variations", (v: PrismaCollectionQuery) => v.all())
      .offset((page - 1) * limit)
      .limit(limit)
      .all() as Promise<ProductCardDbRow[]>,
    getCategoryIndex(),
    getBrandIndex(),
  ]);

  const categoryById = new Map<string, IProductCategoryRef>(
    categories.map((c) => [String(c.id), c])
  );
  const brandById = new Map<string, IProductBrandRef>(
    brands.map((b) => [String(b.id), b])
  );

  // Same shape as `.include("category").include("brand")` would give
  const rows: IProduct[] = products.map((product) => ({
    ...product,
    category: categoryById.get(String(product.categoryId)) ?? null,
    brand: brandById.get(String(product.brandId)) ?? null,
  }));

  return plain(rows);
}

async function queryProductList(key: string): Promise<IStorefrontListResponse<IProduct>> {
  const params: ProductListParams = JSON.parse(key);
  const page = params.page || 1;
  const limit = params.limit || 10;
  const type = (params.type || "latest").toLowerCase();

  let query: PrismaCollectionQuery = activeProducts();

  if (params.search) {
    query = query.where((p: QueryFilterRecord) => p.name.contains(params.search));
  }

  const newest = (p: QueryFilterRecord) => p.createdAt.desc();

  switch (type) {
    case "featured":
      query = query.where({ isFeatured: true }).orderBy(newest);
      break;
    case "toprated":
      query = query.orderBy([(p: QueryFilterRecord) => p.ratingsAverage.desc(), newest]);
      break;
    case "bestselling":
      query = query.orderBy([(p: QueryFilterRecord) => p.totalSold.desc(), newest]);
      break;
    case "freeshipping":
      query = query.where({ isFreeShipping: true }).orderBy(newest);
      break;
    case "related":
      if (params.category) {
        const categoryIds = await getDescendantCategoryIds(params.category);
        query = query.where((p: QueryFilterRecord) => p.categoryId.in(categoryIds));
      }
      query = query.orderBy(newest);
      break;
    case "offer":
    case "discount":
      query = query.where((p: QueryFilterRecord) => p.discountPrice.gt(0)).orderBy(newest);
      break;
    default:
      query = query.orderBy(newest);
      break;
  }

  const products = await loadCards(query, page, limit);
  const total = products.length;

  return {
    success: true,
    data: products,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
  };
}

const cachedProductList = cached(
  "product-list",
  [TAG.products, TAG.categories, TAG.brands],
  queryProductList
);

/** Same shape as GET /api/client/products. */
export function getProductList(params: ProductListParams): Promise<IStorefrontListResponse<IProduct>> {
  const key = JSON.stringify({
    type: (params.type || "latest").toLowerCase(),
    category: params.category || null,
    search: params.search?.trim() || null,
    page: params.page || 1,
    limit: params.limit || 10,
  });
  // Free-text searches are not cached: the key space is unbounded
  return params.search?.trim() ? queryProductList(key) : cachedProductList(key);
}

/* -------------------------------------------------------------------------- */
/*                              Shop filter results                            */
/* -------------------------------------------------------------------------- */

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

async function queryProductFilters(key: string): Promise<IStorefrontListResponse<IProduct>> {
  const params = JSON.parse(key) as {
    search: string | null;
    category: string | null;
    brands: string[];
    minPrice: number | null;
    maxPrice: number | null;
    minRating: number | null;
    sort: string;
    page: number;
    limit: number;
  };

  let query: PrismaCollectionQuery = activeProducts();

  if (params.category) {
    const categoryIds = await getDescendantCategoryIds(params.category);
    query = query.where((p: QueryFilterRecord) => p.categoryId.in(categoryIds));
  }
  if (params.brands.length > 0) {
    query = query.where((p: QueryFilterRecord) => p.brandId.in(params.brands));
  }
  if (params.minPrice !== null) {
    query = query.where((p: QueryFilterRecord) => p.price.gte(params.minPrice));
  }
  if (params.maxPrice !== null) {
    query = query.where((p: QueryFilterRecord) => p.price.lte(params.maxPrice));
  }
  if (params.minRating !== null) {
    query = query.where((p: QueryFilterRecord) => p.ratingsAverage.gte(params.minRating));
  }
  if (params.search) {
    query = query.where((p: QueryFilterRecord) => p.name.contains(params.search));
  }

  let ordered = query;
  switch (params.sort) {
    case "price_asc":
      ordered = ordered.orderBy((p: QueryFilterRecord) => p.price.asc());
      break;
    case "price_desc":
      ordered = ordered.orderBy((p: QueryFilterRecord) => p.price.desc());
      break;
    case "rating":
      ordered = ordered.orderBy((p: QueryFilterRecord) => p.ratingsAverage.desc());
      break;
    case "newest":
      ordered = ordered.orderBy((p: QueryFilterRecord) => p.createdAt.desc());
      break;
    default:
      ordered = ordered.orderBy([
        (p: QueryFilterRecord) => p.isFeatured.desc(),
        (p: QueryFilterRecord) => p.createdAt.desc(),
      ]);
      break;
  }

  // The count and the page are independent: run them side by side, not one after the other
  const [total, products] = await Promise.all([
    query.count(),
    loadCards(ordered, params.page, params.limit),
  ]);

  return {
    success: true,
    data: products,
    meta: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit) || 1,
    },
  };
}

const cachedProductFilters = cached(
  "product-filters",
  [TAG.products, TAG.categories, TAG.brands],
  queryProductFilters
);

/** Same shape as GET /api/client/products/filters. */
export function getProductFilters(params: ProductFilterParams): Promise<IStorefrontListResponse<IProduct>> {
  const search = params.search?.trim() || null;
  const key = JSON.stringify({
    search,
    category: params.category || null,
    brands: params.brand
      ? params.brand.split(",").map((b) => b.trim()).filter(Boolean).sort()
      : [],
    minPrice: toNumber(params.minPrice),
    maxPrice: toNumber(params.maxPrice),
    minRating: toNumber(params.minRating),
    sort: params.sort || "default",
    page: params.page || 1,
    limit: params.limit || 20,
  });
  return search ? queryProductFilters(key) : cachedProductFilters(key);
}

/** Same shape as GET /api/client/products/brands-by-category. */
export const getBrandsByCategory = cached(
  "brands-by-category",
  [TAG.products, TAG.brands, TAG.categories],
  async (category: string | null = null): Promise<IBrandsByCategoryResponse> => {
    let query: PrismaCollectionQuery = activeProducts().where(
      (p: QueryFilterRecord) => p.brandId.isNotNull()
    );

    if (category) {
      const categoryIds = await getDescendantCategoryIds(category);
      query = query.where((p: QueryFilterRecord) => p.categoryId.in(categoryIds));
    }

    const products = (await query
      .select("brandId")
      .include("brand", (b: PrismaCollectionQuery) =>
        b.select("id", "name", "logo", "status", "isDelete")
      )
      .all()) as ProductWithBrandRef[];

    const brandMap = new Map<string, IBrandCategoryItem>();
    for (const p of products) {
      if (p.brand && p.brand.status && !p.brand.isDelete) {
        brandMap.set(String(p.brand.id), {
          id: p.brand.id,
          name: p.brand.name,
          logo: p.brand.logo,
        });
      }
    }

    const brands = Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    return { success: true, data: plain(brands) };
  }
);

/* -------------------------------------------------------------------------- */
/*                               Product details                               */
/* -------------------------------------------------------------------------- */

/** The full product (description, SEO, variations) or null. */
export const getProductBySlug = cached(
  "product-by-slug",
  [TAG.products, TAG.categories, TAG.brands],
  async (slug: string): Promise<IProduct | null> => {
    const product = (await db.orm.public.Product.where({ slug })
      .include("category", (c: PrismaCollectionQuery) => c.select("id", "name", "slug"))
      .include("brand", (b: PrismaCollectionQuery) => b.select("id", "name", "slug"))
      .include("variations", (v: PrismaCollectionQuery) => v.all())
      .first()) as IProduct | null;

    return product ? plain(product) : null;
  }
);

/** Approved reviews of a product. Same shape as GET /api/comments/:productId?accessMode=public. */
export const getProductComments = cached(
  "product-comments",
  [TAG.comments],
  async (productId: string): Promise<IProductCommentsResponse> => {
    const comments = (await db.orm.public.Comment.where({ productId, isApproved: true })
      .include("user", (u: PrismaCollectionQuery) => u.select("id", "name"))
      .orderBy((c: QueryFilterRecord) => c.createdAt.desc())
      .all()) as CommentDbRow[];

    const formatted: IProductCommentItem[] = comments.map((c) => ({
      ...c,
      userId: c.user ? c.user : c.userId,
    }));

    return { success: true, message: "Successfully", data: plain(formatted) };
  }
);
