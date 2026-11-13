import ProductList from './ProductList';
import { getProductList, safe } from '@/lib/storefront-data';

const OfferProducts = async () => {
  const result = await safe(getProductList({ page: 1, limit: 10, type: 'offer' }), null);

  return <ProductList products={result?.data} />;
};

export default OfferProducts;
