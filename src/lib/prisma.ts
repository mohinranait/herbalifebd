import { db } from "@/prisma/db";

export { db };

/**
 * Helper to ensure backwards compatibility with UI that expects MongoDB `_id`
 */
export function formatMongoCompat<T extends Record<string, any>>(data: T): T & { _id: string };
export function formatMongoCompat<T extends Record<string, any>>(data: T[]): (T & { _id: string })[];
export function formatMongoCompat(data: any): any {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map((item) => formatMongoCompat(item));
  }
  if (typeof data === "object" && data !== null) {
    if (isProductRow(data)) {
      return formatProduct(data);
    }
    const formatted: any = { ...data };
    if ("id" in formatted && !("_id" in formatted)) {
      formatted._id = formatted.id;
    }
    // Deep format any nested objects or arrays if necessary
    for (const key of Object.keys(formatted)) {
      if (Array.isArray(formatted[key])) {
        formatted[key] = formatted[key].map((item: any) =>
          typeof item === "object" && item !== null && "id" in item
            ? { ...item, _id: item._id || item.id }
            : item
        );
      } else if (
        typeof formatted[key] === "object" &&
        formatted[key] !== null &&
        "id" in formatted[key]
      ) {
        formatted[key] = {
          ...formatted[key],
          _id: formatted[key]._id || formatted[key].id,
        };
      }
    }
    return formatted;
  }
  return data;
}

/* -------------------------------------------------------------------------- */
/*                         Product shape expected by the UI                    */
/* -------------------------------------------------------------------------- */
// The database stores products flat (ratingsAverage, isFreeShipping, seoTitle,
// categoryId…). The storefront and the admin form still read the original nested
// shape (ratings.average, shipping.isFreeShipping, seo.title, category as an id),
// and their form validation rejects `null` for optional fields.

function isProductRow(data: any): boolean {
  return "productType" in data && "slug" in data && "gallery" in data;
}

/** Drops null/undefined values so optional fields are simply absent. */
function withoutNulls<T extends Record<string, any>>(row: T): Record<string, any> {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== null && value !== undefined));
}

function relationId(relation: any, fallback: any): string | undefined {
  if (relation && typeof relation === "object") return relation.id || relation._id || fallback || undefined;
  return relation || fallback || undefined;
}

export function formatProduct(product: Record<string, any>): Record<string, any> {
  const {
    category,
    brand,
    variations,
    ratingsAverage,
    totalReviews,
    isFreeShipping,
    weight,
    dimensionLength,
    dimensionWidth,
    dimensionHeight,
    seoTitle,
    seoDescription,
    seoKeywords,
    ...rest
  } = product;

  const categoryId = relationId(category, product.categoryId);
  const brandId = relationId(brand, product.brandId);

  return {
    ...withoutNulls(rest),
    _id: product._id || product.id,
    selectedAttributes: Array.isArray(product.selectedAttributes) ? product.selectedAttributes : [],
    gallery: Array.isArray(product.gallery) ? product.gallery : [],
    tags: Array.isArray(product.tags) ? product.tags : [],
    stock: product.stock ?? 0,

    // relations: id for the UI, populated documents kept alongside
    ...(categoryId ? { category: categoryId, categoryId } : {}),
    ...(brandId ? { brand: brandId, brandId } : {}),
    ...(category && typeof category === "object" ? { categoryInfo: { ...category, _id: category._id || category.id } } : {}),
    ...(brand && typeof brand === "object" ? { brandInfo: { ...brand, _id: brand._id || brand.id } } : {}),

    variations: Array.isArray(variations)
      ? variations.map((variation: any) => ({
          ...withoutNulls(variation),
          _id: variation._id || variation.id,
          images: Array.isArray(variation.images) ? variation.images : [],
        }))
      : [],

    ratings: {
      average: ratingsAverage ?? 0,
      totalReviews: totalReviews ?? 0,
    },
    shipping: {
      isFreeShipping: Boolean(isFreeShipping),
      ...withoutNulls({ weight }),
      dimensions: withoutNulls({ length: dimensionLength, width: dimensionWidth, height: dimensionHeight }),
    },
    seo: {
      title: seoTitle ?? "",
      description: seoDescription ?? "",
      keywords: Array.isArray(seoKeywords) ? seoKeywords : [],
    },
  };
}

export default db;
