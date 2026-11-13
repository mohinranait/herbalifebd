import { fetchData } from '@/lib/fetch-data';
import { IProductListResponse } from '@/redux/service/products/type';
import NewArrivalsSlider from './NewArrivalsSlider';

const NewProducts = async () => {
  const getProducts = await fetchData<IProductListResponse>(
    {
      api: `client/products?page=1&limit=12&type=new`,
      revalidate: 1000,
    },
    1
  );

  const newProducts = getProducts?.data;

  return <NewArrivalsSlider products={newProducts} />;
};

export default NewProducts;
