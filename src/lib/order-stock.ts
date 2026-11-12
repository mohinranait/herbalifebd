import { db } from "@/prisma/db";

/** Statuses in which the ordered goods are no longer held for the order. */
export const CLOSED_STATUSES = ["CANCELLED", "RETURNED"];

/** Puts the items of an order back into stock (used on cancel, return and delete). */
export async function restoreOrderStock(items: any[]) {
  for (const item of items || []) {
    const product = await db.orm.products.where({ id: item.productId }).first();
    if (product) {
      await db.orm.products.where({ id: product.id }).update({
        stock: (product.stock || 0) + item.quantity,
        totalSold: Math.max(0, (product.totalSold || 0) - item.quantity),
      });
    }

    if (item.variationId) {
      const variation = await db.orm.product_variations.where({ id: item.variationId }).first();
      if (variation) {
        await db.orm.product_variations.where({ id: variation.id }).update({
          stock: (variation.stock || 0) + item.quantity,
        });
      }
    }
  }
}

/** Takes the items of an order out of stock again (a cancelled order is re-opened). */
export async function deductOrderStock(items: any[]) {
  for (const item of items || []) {
    const product = await db.orm.products.where({ id: item.productId }).first();
    if (product) {
      await db.orm.products.where({ id: product.id }).update({
        stock: Math.max(0, (product.stock || 0) - item.quantity),
        totalSold: (product.totalSold || 0) + item.quantity,
      });
    }

    if (item.variationId) {
      const variation = await db.orm.product_variations.where({ id: item.variationId }).first();
      if (variation) {
        await db.orm.product_variations.where({ id: variation.id }).update({
          stock: Math.max(0, (variation.stock || 0) - item.quantity),
        });
      }
    }
  }
}
