import { Skeleton } from "@/components/ui/skeleton";

export const SuccessPageSkeleton = () => {
  return (
    <div className="min-h-screen py-8 sm:py-12 px-3 sm:px-4 bg-slate-50/60">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Card Skeleton */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-xs">
          <Skeleton className="w-16 h-16 rounded-full mx-auto" />
          <Skeleton className="h-7 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 max-w-full mx-auto" />
          <Skeleton className="h-8 w-48 rounded-full mx-auto mt-2" />
        </div>

        {/* 2-Column Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4">
              <Skeleton className="h-5 w-40" />
              <div className="flex justify-between items-center py-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="w-8 h-8 rounded-full" />
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4">
              <Skeleton className="h-5 w-32" />
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-6 w-full mt-4" />
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
