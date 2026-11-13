import { IProduct } from '@/redux/service/products/type';
import Breadcrumb from './Breadcrumb';
import ProductView from './ProductView';
import RelatedProducts from './RelatedProducts';
import { Suspense } from 'react';
import ProductsSkeleton from '@/app/(root)/components/ProductsSkeleton';

export async function ProductDetailss({ product }: { product: IProduct }) {
  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Breadcrumb Navigation */}
      <Breadcrumb name={product?.name} />

      {/* Main Product Details (Gallery + Actions on left, Info & Description on right) */}
      <div className="container mx-auto px-4 max-w-[1276px] py-6 sm:py-8">
        <ProductView product={product} />
      </div>

      {/* Related Products Section (একই ক্যাটাগরির আরও প্রোডাক্ট) */}
      <div className="container mx-auto px-4 max-w-[1276px] pt-10 sm:pt-14 border-t border-slate-100">
        <div className="mb-6 border-b border-slate-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            একই ক্যাটাগরির আরও প্রোডাক্ট
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            আপনার পছন্দের ক্যাটাগরির অন্যান্য জনপ্রিয় পণ্যসমূহ
          </p>
        </div>

        <Suspense fallback={<ProductsSkeleton />}>
          {product?.categoryId && <RelatedProducts catId={product.categoryId} />}
        </Suspense>
      </div>
    </div>
  );
}
