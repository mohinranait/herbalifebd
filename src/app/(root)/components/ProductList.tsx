import ProductCard from '@/components/products/ProductCard';
import { IProduct } from '@/redux/service/products/type';
import React from 'react';

type Props = {
  products: IProduct[] | undefined;
};

const ProductList = ({ products }: Props) => {
  return (
    <div className="container mx-auto px-2 md:px-4">
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {products.map((product, i) => (
            <ProductCard key={product?._id || i} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 text-sm">কোন পণ্য পাওয়া যায়নি</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
