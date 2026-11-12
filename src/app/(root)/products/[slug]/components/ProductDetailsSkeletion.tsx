import { Skeleton } from "@/components/ui/skeleton";

export const ProductDetailsSkeleton = () => {
  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Breadcrumb Skeleton */}
      <div className="bg-white border-b border-slate-100 py-3">
        <div className="container mx-auto px-4 max-w-[1276px]">
          <Skeleton className="h-4 w-60 rounded" />
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-[1276px] py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Gallery & Action Buttons Skeleton */}
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="w-full aspect-square rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-8 w-3/4 rounded" />
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-10 w-36 rounded" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
