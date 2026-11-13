import React from 'react';

const HorizontalProductsSkeleton = () => {
  return (
    <div className="container mx-auto px-2 md:px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3.5 animate-pulse"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 shrink-0 rounded-xl bg-slate-100" />
            <div className="flex-1 min-w-0 space-y-2 py-1">
              <div className="h-3 w-16 bg-slate-100 rounded" />
              <div className="h-4 w-4/5 bg-slate-100 rounded" />
              <div className="h-3 w-14 bg-slate-100 rounded" />
              <div className="h-5 w-24 bg-slate-100 rounded mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalProductsSkeleton;
