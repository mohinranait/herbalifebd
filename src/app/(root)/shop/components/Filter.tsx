"use client";

import { ICategory } from "@/redux/service/categories/type";
import { CategoryTree } from "./CategoryTree";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { IBrand } from "@/redux/service/brand/type";
import { Tag, DollarSign, Star, RotateCcw } from "lucide-react";
import { CURRENCY } from "@/lib/envSecret";

type TFilterProps = {
  categories: ICategory[];
  activeCat: string;
  handleCatChange: (id: string) => void;
  brands: IBrand[];
  selectedBrands: string[];
  toggleBrand: (id: string) => void;
  minPrice: number;
  setMinPrice: Dispatch<SetStateAction<number>>;
  maxPrice: number;
  setMaxPrice: Dispatch<SetStateAction<number>>;
  activeRating: number;
  setActiveRating: Dispatch<SetStateAction<number>>;
  onClearAll: () => void;
};

export function FilterSidebar({
  categories,
  activeCat,
  handleCatChange,
  brands,
  selectedBrands,
  toggleBrand,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  activeRating,
  setActiveRating,
  onClearAll,
}: TFilterProps) {
  return (
    <div className="flex flex-col gap-6 text-sm">
      {/* 1. Category Tree */}
      <CategoryTree
        categories={categories}
        activeCat={activeCat}
        handleCatChange={handleCatChange}
      />

      {/* 2. Brands Filter */}
      {brands && brands.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 pb-2 mb-2.5 border-b border-slate-100">
            <Tag className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              ব্র্যান্ডসমূহ
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {brands.map((brand, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={selectedBrands.includes(brand?.id.toString())}
                  onCheckedChange={() => toggleBrand(brand?.id.toString())}
                  className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label
                  htmlFor={`brand-${brand.id}`}
                  className="flex items-center gap-2 cursor-pointer font-medium text-xs sm:text-sm text-slate-700 hover:text-orange-600 transition-colors"
                >
                  {brand.logo && (
                    <Image
                      src={brand.logo}
                      width={18}
                      height={18}
                      alt={brand.name}
                      className="rounded-xs object-contain"
                    />
                  )}
                  <span>{brand.name}</span>
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Price Range Filter */}
      <div>
        <div className="flex items-center gap-1.5 pb-2 mb-2.5 border-b border-slate-100">
          <DollarSign className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            মূল্য পরিসীমা
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
              {CURRENCY}
            </span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice || ""}
              onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
              className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded-lg bg-white text-xs sm:text-sm focus:outline-hidden focus:border-orange-500 text-slate-800"
            />
          </div>
          <span className="text-slate-400 font-bold">–</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
              {CURRENCY}
            </span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice || ""}
              onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
              className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded-lg bg-white text-xs sm:text-sm focus:outline-hidden focus:border-orange-500 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* 4. Customer Rating Filter */}
      <div>
        <div className="flex items-center gap-1.5 pb-2 mb-2.5 border-b border-slate-100">
          <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            রেটিং অনুযায়ী
          </span>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {[5, 4, 3, 2].map((r) => {
            const isSelected = activeRating === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRating(activeRating === r ? 0 : r)}
                className={cn(
                  "px-3 py-1 text-xs rounded-lg border transition-colors flex items-center gap-1 cursor-pointer",
                  isSelected
                    ? "bg-orange-50 text-orange-600 border-orange-300 font-bold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                )}
              >
                <span>{r}</span>
                <Star className={cn("w-3 h-3", isSelected ? "text-orange-500 fill-orange-500" : "text-amber-400 fill-amber-400")} />
                {r < 5 && <span>+</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Clear All Filters Button */}
      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-600 transition-colors cursor-pointer pt-2 border-t border-slate-100"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>সকল ফিল্টার রিসেট করুন</span>
      </button>
    </div>
  );
}
