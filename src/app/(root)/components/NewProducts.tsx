import { getProductList, safe } from '@/lib/storefront-data';
import NewArrivalsSlider from './NewArrivalsSlider';
import { HOME_PRODUCT_LISTS } from './home-queries';

const NewProducts = async () => {
  const result = await safe(getProductList(HOME_PRODUCT_LISTS.newArrivals), null);

  return <NewArrivalsSlider products={result?.data} />;
};

export default NewProducts;
