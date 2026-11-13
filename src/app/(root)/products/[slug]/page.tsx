import { ProductDetailss } from './components/product-details2';
import { IProduct } from '@/redux/service/products/type';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BASE_URL } from '@/lib/envSecret';
import {
  getProductBySlug,
  getProductComments,
  getProductList,
  safe,
} from '@/lib/storefront-data';
import QueryHydrator from '@/providers/QueryHydrator';
import { relatedProductsQuery } from './components/RelatedProducts';

type Props = {
  params: Promise<{ slug: string }>;
};

// generateMetadata and the page ask for the same product: it is read once
// (and comes from the cache on every later visit).
const loadProduct = async (slug: string) =>
  (await safe(getProductBySlug(decodeURIComponent(slug)), null)) as IProduct | null;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const image = product?.gallery?.[0] || '';

  const title = product?.seo?.title || product?.name;
  const description = product?.seo?.description || product?.shortDescription || '';

  return {
    title,
    description,
    keywords: product?.tags?.join(',') || '',

    alternates: {
      canonical: `${BASE_URL}/products/${slug}`,
    },

    openGraph: {
      title,
      description,
      url: `${BASE_URL}/products/${slug}`,
      type: 'website',

      images: [
        {
          secureUrl: image || '',
          url: image,
          width: 1200,
          height: 630,
          alt: product?.name,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

const ProductDetails = async ({ params }: Props) => {
  const { slug } = await params;
  const product = await loadProduct(slug);

  if (!product) notFound();

  // Start the related products now; that section picks up this same promise
  if (product.category) {
    void getProductList(relatedProductsQuery(product.category)).catch(() => null);
  }

  const comments = await safe(getProductComments(product._id), null);

  return (
    <div>
      {/* Reviews arrive inside the HTML: the rating and review tabs render at once */}
      <QueryHydrator
        entries={[
          {
            endpointName: 'getCommentByProductId',
            arg: { productId: product._id, params: 'accessMode=public' },
            value: comments,
          },
        ]}
      />
      <ProductDetailss product={product} />
    </div>
  );
};

export default ProductDetails;
