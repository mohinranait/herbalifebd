import { db } from "@/prisma/db";

/** Statuses in which the ordered goods are no longer held for the order. */
export const CLOSED_STATUSES = ["CANCELLED", "RETURNED"];

export type OrderItemStockRef = {
  productId: string;
  variationId?: string | null;
  quantity: number | string;
};

/** Puts the items of an order back into stock (used on cancel, return and delete). */
export async function restoreOrderStock(items: OrderItemStockRef[] | null | undefined) {
  for (const item of items || []) {
    const qty = Math.max(0, Number(item?.quantity) || 0);
    if (!qty) continue;

    if (item.productId) {
      const product = await db.orm.public.Product.where({ id: item.productId }).first();
      if (product) {
        await db.orm.public.Product.where({ id: product.id }).update({
          stock: (product.stock || 0) + qty,
          totalSold: Math.max(0, (product.totalSold || 0) - qty),
        });
      }
    }

    if (item.variationId) {
      const variation = await db.orm.public.ProductVariation.where({ id: item.variationId }).first();
      if (variation) {
        await db.orm.public.ProductVariation.where({ id: variation.id }).update({
          stock: (variation.stock || 0) + qty,
        });
      }
    }
  }
}

/** Takes the items of an order out of stock again (a cancelled order is re-opened). */
export async function deductOrderStock(items: OrderItemStockRef[] | null | undefined) {
  for (const item of items || []) {
    const qty = Math.max(0, Number(item?.quantity) || 0);
    if (!qty) continue;

    if (item.productId) {
      const product = await db.orm.public.Product.where({ id: item.productId }).first();
      if (product) {
        await db.orm.public.Product.where({ id: product.id }).update({
          stock: Math.max(0, (product.stock || 0) - qty),
          totalSold: (product.totalSold || 0) + qty,
        });
      }
    }

    if (item.variationId) {
      const variation = await db.orm.public.ProductVariation.where({ id: item.variationId }).first();
      if (variation) {
        await db.orm.public.ProductVariation.where({ id: variation.id }).update({
          stock: Math.max(0, (variation.stock || 0) - qty),
        });
      }
    }
  }
}
