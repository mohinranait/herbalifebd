import HeroSection from './components/hero-area';
import SliderCategories from './components/SliderCategories';
import Categories from './components/categories';
import SectionHeader from '@/components/shared/SectionHeader';
import TopSelling from './components/TopSelling';
import NewProducts from './components/NewProducts';
import AllProducts from './components/AllProducts';
import BrandsSection from './components/BrandsSection';
import { getAppSetting } from '@/lib/get-app-setting';
import { Suspense } from 'react';
import ProductsSkeleton from './components/ProductsSkeleton';
import HorizontalProductsSkeleton from './components/HorizontalProductsSkeleton';
import QueryHydrator from '@/providers/QueryHydrator';
import {
  getBrandList,
  getCategoryList,
  getProductList,
  getSliderList,
  safe,
} from '@/lib/storefront-data';
import { HOME_PRODUCT_LISTS } from './components/home-queries';

// Rendered per request from cached data: no database is needed at build time
export const dynamic = 'force-dynamic';

const HomePage = async () => {
  // Start the product lists now, so they load side by side with everything else
  // (the sections below pick up these same promises).
  for (const params of Object.values(HOME_PRODUCT_LISTS)) {
    void getProductList(params).catch(() => null);
  }

  const [appSetting, sliders, categories, brands] = await Promise.all([
    getAppSetting(),
    safe(getSliderList(10), null),
    safe(getCategoryList({ page: 1, limit: 20 }), null),
    safe(getBrandList(30), null),
  ]);
  const enableCategory = appSetting?.layouts?.categorySection || 1;

  return (
    <div className="bg-[#f8fafc] min-h-screen  space-y-4 md:space-y-6">
      {/* Slider, categories and brands arrive inside the HTML: no loading state */}
      <QueryHydrator
        entries={[
          { endpointName: 'getSliders', arg: 'page=1&limit=10&isDelete=false&status=true', value: sliders },
          { endpointName: 'getCategories', arg: 'page=1&limit=20&isDelete=false&status=true', value: categories },
          { endpointName: 'getBrands', arg: 'page=1&limit=30&status=true&isDelete=false', value: brands },
        ]}
      />

      {/* 1. Hero / Slider Section */}
      <HeroSection />

      {/* 2. জনপ্রিয় ক্যাটাগরি Section */}
      {enableCategory === 1 ? <SliderCategories /> : <Categories />}

      {/* 3. বেস্ট সেলিং প্রডাক্ট Section */}
      <section className="py-4 md:py-6">
        <SectionHeader
          title="বেস্ট সেলিং প্রডাক্ট"
          icon="🔥"
          seeAllLink="/shop?type=bestselling"
          seeAllText="সবগুলো দেখুন"
        />
        <Suspense fallback={<ProductsSkeleton />}>
          <TopSelling />
        </Suspense>
      </section>

      {/* 4. শপে নতুন এসেছে Section */}
      <section className="py-4 md:py-6">
        <SectionHeader
          title="শপে নতুন এসেছে"
          seeAllLink="/shop?type=new"
          seeAllText="সবগুলো দেখুন"
        />
        <Suspense fallback={<HorizontalProductsSkeleton />}>
          <NewProducts />
        </Suspense>
      </section>

      {/* 5. সকল প্রডাক্ট Section */}
      <section className="py-4 md:py-6">
        <SectionHeader
          title="সকল প্রডাক্ট"
          icon="📦"
          seeAllLink="/shop"
          seeAllText="সবগুলো দেখুন"
        />
        <Suspense fallback={<ProductsSkeleton />}>
          <AllProducts />
        </Suspense>
      </section>

      {/* 6. ব্র্যান্ড সমূহ Section */}
      <BrandsSection />
    </div>
  );
};

export default HomePage;
