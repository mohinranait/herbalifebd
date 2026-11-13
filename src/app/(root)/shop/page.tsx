import React, { Suspense } from 'react';
import { ShopContent } from './components/ShopContent';
import QueryHydrator from '@/providers/QueryHydrator';
import { getBrandsByCategory, getProductFilters, safe } from '@/lib/storefront-data';
import { IProductFilterParams } from '@/redux/client/products/type';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) || '';

const ShopPage = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const category = first(params.category);
  const search = first(params.search);

  // Exactly the first query ShopContent makes for this URL, so its products and
  // brands are already in the page instead of being fetched after it loads.
  const filterArg: IProductFilterParams = { sort: 'default', page: 1, limit: 20 };
  if (category) filterArg.category = category;
  if (search) filterArg.search = search;

  const [products, brands] = await Promise.all([
    safe(getProductFilters(filterArg), null),
    safe(getBrandsByCategory(category || null), null),
  ]);

  return (
    <>
      <QueryHydrator
        entries={[
          { endpointName: 'getProductsForFilters', arg: filterArg, value: products },
          { endpointName: 'getBrandsByCategory', arg: category || undefined, value: brands },
        ]}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <ShopContent />
      </Suspense>
    </>
  );
};

export default ShopPage;
