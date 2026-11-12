import Link from 'next/link';
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  name: string;
}

const Breadcrumb = ({ name }: BreadcrumbProps) => {
  return (
    <div className="bg-white border-b border-slate-100">
      <div className="container mx-auto px-4 max-w-[1276px] py-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 overflow-x-auto no-scrollbar">
          <Link
            href="/"
            className="text-slate-600 hover:text-[#ff7a00] transition-colors shrink-0"
          >
            হোম
          </Link>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <Link
            href="/shop"
            className="text-slate-600 hover:text-[#ff7a00] transition-colors shrink-0"
          >
            প্রডাক্টস
          </Link>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <span
            className="text-slate-800 font-medium truncate max-w-[240px] sm:max-w-md shrink-0"
            title={name}
          >
            {name}
          </span>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
