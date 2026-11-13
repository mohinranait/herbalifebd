import type { ProductListParams } from '@/lib/storefront-data';

/** The product lists of the home page: one definition for the preload and the sections. */
export const HOME_PRODUCT_LISTS = {
  bestSelling: { page: 1, limit: 10, type: 'bestselling' },
  newArrivals: { page: 1, limit: 12, type: 'new' },
  all: { page: 1, limit: 15 },
} satisfies Record<string, ProductListParams>;
