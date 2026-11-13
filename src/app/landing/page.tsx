import { redirect } from 'next/navigation';
import { getProductList, safe } from '@/lib/storefront-data';

export const dynamic = 'force-dynamic';

export default async function LandingIndexPage() {
  const result = await safe(getProductList({ page: 1, limit: 1, type: 'bestselling' }), null);
  const firstProduct = result?.data?.[0];

  if (firstProduct?.slug) {
    redirect(`/landing/${firstProduct.slug}`);
  }

  redirect('/shop');
}
