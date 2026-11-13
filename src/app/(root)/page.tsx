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

const HomePage = async () => {
  const appSetting = await getAppSetting();
  const enableCategory = appSetting?.layouts?.categorySection || 1;

  return (
    <div className="bg-[#f8fafc] min-h-screen  space-y-4 md:space-y-6">
      {/* 1. Hero / Slider Section */}
      <HeroSection />

      {/* 2. জনপ্রিয় ক্যাটাগরি Section */}
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
