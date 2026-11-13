import { getProductList, safe } from "@/lib/storefront-data";
import ProductList from "./ProductList";
import { HOME_PRODUCT_LISTS } from "./home-queries";

const TopSelling = async () => {
  const result = await safe(getProductList(HOME_PRODUCT_LISTS.bestSelling), null);

  return <ProductList products={result?.data} />;
};

export default TopSelling;
