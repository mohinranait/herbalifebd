import ProductList from '@/app/(root)/components/ProductList';
import { getProductList, safe, type ProductListParams } from '@/lib/storefront-data';

/** One definition for the page's preload and this section, so both share a single query. */
export const relatedProductsQuery = (catId: string): ProductListParams => ({
  page: 1,
  limit: 8,
  type: 'related',
  category: catId,
});

const RelatedProducts = async ({ catId }: { catId: string }) => {
  const result = await safe(getProductList(relatedProductsQuery(catId)), null);

  return <ProductList products={result?.data} />;
};

export default RelatedProducts;
