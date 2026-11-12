import { db } from "@/prisma/db";

/** A rating is a whole number from 1 to 5; anything else falls back to 5. */
export function normalizeRating(value: unknown, fallback = 5): number {
  const rating = Math.round(Number(value));
  if (!Number.isFinite(rating)) return fallback;
  return Math.min(5, Math.max(1, rating));
}

/** Recomputes a product's average rating and review count from its approved comments. */
export async function recalculateProductRating(productId: string) {
  const comments = await db.orm.comments
    .where({ productId, isApproved: true })
    .select("rating")
    .all();

  const total = comments.length;
  const sum = comments.reduce((acc: number, c: any) => acc + (c.rating || 0), 0);

  await db.orm.products.where({ id: productId }).update({
    totalReviews: total,
    ratingsAverage: total > 0 ? Number((sum / total).toFixed(1)) : 0,
  });
}
