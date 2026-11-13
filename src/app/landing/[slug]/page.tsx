import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BASE_URL } from '@/lib/envSecret';
import { getProductBySlug, getProductComments, safe } from '@/lib/storefront-data';
import { IProduct } from '@/redux/service/products/type';
import QueryHydrator from '@/providers/QueryHydrator';
import LandingView from './components/LandingView';

type Props = {
  params: Promise<{ slug: string }>;
};

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

  const image = product?.gallery?.[0] || product?.thumbnail || '';
  const title = `${product?.name} - স্পেশাল অফার ও ক্যাশ অন ডেলিভারি`;
  const description =
    product?.seoDescription ||
    product?.shortDescription ||
    `অর্ডার করুন ${product.name}। ১০০% অরিজিনাল, সারা বাংলাদেশে দ্রুত ক্যাশ অন ডেলিভারি।`;

  return {
    title,
    description,
    keywords: product?.tags?.join(',') || '',
    alternates: {
      canonical: `${BASE_URL}/landing/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/landing/${slug}`,
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

export default async function ProductLandingPage({ params }: Props) {
  const { slug } = await params;
  const product = await loadProduct(slug);

  if (!product) notFound();

  const comments = await safe(getProductComments(product.id), null);

  return (
    <div>
      <QueryHydrator
        entries={[
          {
            endpointName: 'getCommentByProductId',
            arg: { productId: product.id, params: 'accessMode=public' },
            value: comments,
          },
        ]}
      />
      <LandingView product={product} initialComments={comments?.data || []} />
    </div>
  );
}
