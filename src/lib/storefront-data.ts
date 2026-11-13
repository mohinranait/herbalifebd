import { unstable_cache } from "next/cache";
import { cache } from "react";
import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";

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
  return cache(unstable_cache(fn, ["storefront", name], { tags, revalidate: REVALIDATE_SECONDS }));
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

export const getSettings = cached("settings", [TAG.setting], async () => {
  const settings = await db.orm.public.AppSetting.first();
  return settings ? plain(formatMongoCompat(settings)) : null;
});

/* -------------------------------------------------------------------------- */
/*                                 Categories                                  */
/* -------------------------------------------------------------------------- */

/** All active categories (newest first), each with the product count of its whole subtree. */
const getActiveCategories = cached("categories", [TAG.categories, TAG.products], async () => {
  const [categories, activeProducts] = await Promise.all([
    db.orm.public.Category.where({ isDelete: false, status: true })
      .orderBy((c: any) => c.createdAt.desc())
      .all(),
    db.orm.public.Product.where({ status: true, isDelete: false }).select("categoryId").all(),
  ]);

  const childrenOf = new Map<string, string[]>();
  for (const node of categories as any[]) {
    if (!node.parentId) continue;
    const parentId = String(node.parentId);
    childrenOf.set(parentId, [...(childrenOf.get(parentId) || []), String(node.id)]);
  }

  const directCount = new Map<string, number>();
  for (const product of activeProducts as any[]) {
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

  const withCount = (categories as any[]).map((cat) => ({
    ...cat,
    totalProducts: countWithDescendants(String(cat.id)),
  }));

  return plain(formatMongoCompat(withCount)) as any[];
});

/** Same shape as GET /api/admin/categories?status=true&isDelete=false[&page&limit]. */
export async function getCategoryList(options: { page?: number; limit?: number } = {}) {
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
      if (cat.parentId && String(cat.parentId) === current) queue.push(String(cat._id));
    }
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/*                              Sliders and brands                             */
/* -------------------------------------------------------------------------- */

/** Same shape as GET /api/admin/sliders?page=1&limit=10&isDelete=false&status=true. */
export const getSliderList = cached("sliders", [TAG.sliders], async (limit: number = 10) => {
  const sliders = await db.orm.public.Slider.where({ status: true, isDelete: false })
    .orderBy([(s: any) => s.order.asc(), (s: any) => s.createdAt.desc()])
    .all();

  return {
    success: true,
    data: plain(formatMongoCompat(sliders.slice(0, limit))) as any[],
    meta: { total: sliders.length, page: 1, limit, totalPages: Math.ceil(sliders.length / limit) || 1 },
  };
});

/** Same shape as GET /api/admin/brands?page=1&limit=30&status=true&isDelete=false. */
export const getBrandList = cached("brands", [TAG.brands], async (limit: number = 30) => {
  const brands = await db.orm.public.Brand.where({ status: true, isDelete: false })
    .orderBy((b: any) => b.createdAt.desc())
    .all();

  return {
    success: true,
    message: "Success",
    data: plain(formatMongoCompat(brands.slice(0, limit))) as any[],
    meta: { total: brands.length, page: 1, limit, totalPages: Math.ceil(brands.length / limit) || 1 },
  };
});

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

const activeProducts = () => db.orm.public.Product.where({ status: true, isDelete: false });

// Category and brand names for the cards come from two tiny cached lookups
// instead of being joined onto every product row: the joined documents (with
// their descriptions and banners) were about half of every list response.
const getCategoryIndex = cached("category-index", [TAG.categories], async () => {
  const rows = await db.orm.public.Category.select("id", "name", "slug").all();
  return plain(rows) as { id: string; name: string; slug: string }[];
});

const getBrandIndex = cached("brand-index", [TAG.brands], async () => {
  const rows = await db.orm.public.Brand.select("id", "name", "slug", "logo").all();
  return plain(rows) as { id: string; name: string; slug: string; logo?: string }[];
});

/** One light query for the products (+ variations), names attached from the cached lookups. */
async function loadCards(query: any, page: number, limit: number): Promise<any[]> {
  const [products, categories, brands] = await Promise.all([
    query
      .select(...PRODUCT_CARD_FIELDS)
      .include("variations", (v: any) => v.all())
      .offset((page - 1) * limit)
      .limit(limit)
      .all(),
    getCategoryIndex(),
    getBrandIndex(),
  ]);

  const categoryById = new Map(categories.map((c) => [String(c.id), c]));
  const brandById = new Map(brands.map((b) => [String(b.id), b]));

  const rows = (products as any[]).map((product) => ({
    ...product,
    category: categoryById.get(String(product.categoryId)) || undefined,
    brand: brandById.get(String(product.brandId)) || undefined,
  }));

  return plain(formatMongoCompat(rows)) as any[];
}

export type ProductListParams = {
  type?: string;
  category?: string | null;
  search?: string | null;
  page?: number;
  limit?: number;
};

async function queryProductList(key: string) {
  const params: ProductListParams = JSON.parse(key);
  const page = params.page || 1;
  const limit = params.limit || 10;
  const type = (params.type || "latest").toLowerCase();

  let query = activeProducts();

  if (params.search) {
    query = query.where((p: any) => p.name.contains(params.search));
  }

  const newest = (p: any) => p.createdAt.desc();

  switch (type) {
    case "featured":
      query = query.where({ isFeatured: true }).orderBy(newest);
      break;
    case "toprated":
      query = query.orderBy([(p: any) => p.ratingsAverage.desc(), newest]);
      break;
    case "bestselling":
      query = query.orderBy([(p: any) => p.totalSold.desc(), newest]);
      break;
    case "freeshipping":
      query = query.where({ isFreeShipping: true }).orderBy(newest);
      break;
    case "related":
      if (params.category) {
        const categoryIds = await getDescendantCategoryIds(params.category);
        query = query.where((p: any) => p.categoryId.in(categoryIds));
      }
      query = query.orderBy(newest);
      break;
    case "offer":
    case "discount":
      query = query.where((p: any) => p.discountPrice.gt(0)).orderBy(newest);
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
export function getProductList(params: ProductListParams) {
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

const toNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

async function queryProductFilters(key: string) {
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

  let query = activeProducts();

  if (params.category) {
    const categoryIds = await getDescendantCategoryIds(params.category);
    query = query.where((p: any) => p.categoryId.in(categoryIds));
  }
  if (params.brands.length > 0) {
    query = query.where((p: any) => p.brandId.in(params.brands));
  }
  if (params.minPrice !== null) {
    query = query.where((p: any) => p.price.gte(params.minPrice));
  }
  if (params.maxPrice !== null) {
    query = query.where((p: any) => p.price.lte(params.maxPrice));
  }
  if (params.minRating !== null) {
    query = query.where((p: any) => p.ratingsAverage.gte(params.minRating));
  }
  if (params.search) {
    query = query.where((p: any) => p.name.contains(params.search));
  }

  let ordered = query;
  switch (params.sort) {
    case "price_asc":
      ordered = ordered.orderBy((p: any) => p.price.asc());
      break;
    case "price_desc":
      ordered = ordered.orderBy((p: any) => p.price.desc());
      break;
    case "rating":
      ordered = ordered.orderBy((p: any) => p.ratingsAverage.desc());
      break;
    case "newest":
      ordered = ordered.orderBy((p: any) => p.createdAt.desc());
      break;
    default:
      ordered = ordered.orderBy([(p: any) => p.isFeatured.desc(), (p: any) => p.createdAt.desc()]);
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
export function getProductFilters(params: ProductFilterParams) {
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
  async (category: string | null = null) => {
    let query = activeProducts().where((p: any) => p.brandId.isNotNull());

    if (category) {
      const categoryIds = await getDescendantCategoryIds(category);
      query = query.where((p: any) => p.categoryId.in(categoryIds));
    }

    const products = await query
      .select("brandId")
      .include("brand", (b: any) => b.select("id", "name", "logo", "status", "isDelete"))
      .all();

    const brandMap = new Map<string, any>();
    for (const p of products as any[]) {
      if (p.brand && p.brand.status && !p.brand.isDelete) {
        brandMap.set(String(p.brand.id), {
          _id: p.brand.id,
          id: p.brand.id,
          name: p.brand.name,
          logo: p.brand.logo,
        });
      }
    }

    const brands = Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    return { success: true, data: plain(formatMongoCompat(brands)) as any[] };
  }
);

/* -------------------------------------------------------------------------- */
/*                               Product details                               */
/* -------------------------------------------------------------------------- */

/** The full product (description, SEO, variations) or null. */
export const getProductBySlug = cached(
  "product-by-slug",
  [TAG.products, TAG.categories, TAG.brands],
  async (slug: string) => {
    const product = await db.orm.public.Product.where({ slug })
      .include("category", (c: any) => c.select("id", "name", "slug"))
      .include("brand", (b: any) => b.select("id", "name", "slug"))
      .include("variations", (v: any) => v.all())
      .first();

    return product ? (plain(formatMongoCompat(product)) as any) : null;
  }
);

/** Approved reviews of a product. Same shape as GET /api/comments/:productId?accessMode=public. */
export const getProductComments = cached(
  "product-comments",
  [TAG.comments],
  async (productId: string) => {
    const comments = await db.orm.public.Comment.where({ productId, isApproved: true })
      .include("user", (u: any) => u.select("id", "name"))
      .orderBy((c: any) => c.createdAt.desc())
      .all();

    const formatted = (comments as any[]).map((c) => ({
      ...c,
      userId: c.user ? formatMongoCompat(c.user) : c.userId,
    }));

    return { success: true, message: "Successfully", data: plain(formatMongoCompat(formatted)) as any[] };
  }
);
