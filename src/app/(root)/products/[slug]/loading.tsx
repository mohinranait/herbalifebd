import { ProductDetailsSkeleton } from './components/ProductDetailsSkeletion';

// Shown instantly when a product link is clicked, while the page streams in
export default function Loading() {
  return <ProductDetailsSkeleton />;
}
