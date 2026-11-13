"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { useGetCategoriesQuery } from "@/redux/service/categories";
import { SlidersHorizontal, X, Filter, ChevronLeft, ChevronRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import ProductCard from "@/components/products/ProductCard";
import { useGetBrandsByCategoryQuery, useGetProductsForFiltersQuery } from "@/redux/client/products";
import { IProductFilterParams } from "@/redux/client/products/type";
import { FilterSidebar } from "./Filter";

const SORT_OPTIONS = [
  { value: "default", label: "ফিচার্ড / জনপ্রিয়" },
  { value: "price_asc", label: "মূল্য: কম থেকে বেশি" },
  { value: "price_desc", label: "মূল্য: বেশি থেকে কম" },
  { value: "rating", label: "টপ রেটেড" },
  { value: "newest", label: "নতুন আগমন" },
];

export function ShopContent() {
  const searchParams = useSearchParams();

  const search = searchParams.get("search");
  const activeCat = searchParams.get("category") || "";

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [activeRating, setActiveRating] = useState(0);
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);

  const { data: catData } = useGetCategoriesQuery("status=true&isDelete=false");
  const categories = catData?.data || [];

  const { data: brandData } = useGetBrandsByCategoryQuery(activeCat || undefined);
  const getAllBrands = brandData?.data || [];
  const brands = getAllBrands.filter((brand) => !brand.isDelete);
  const router = useRouter();

  const queryParams = useMemo((): IProductFilterParams => {
    const p: IProductFilterParams = { sort, page, limit: 20 };
    if (activeCat) p.category = activeCat;
    if (search) p.search = search;
    if (selectedBrands.length) p.brand = selectedBrands.join(",");
    if (minPrice > 0) p.minPrice = minPrice;
    if (maxPrice > 0) p.maxPrice = maxPrice;
    if (activeRating > 0) p.minRating = activeRating;
    return p;
  }, [activeCat, selectedBrands, minPrice, maxPrice, activeRating, sort, page, search]);

  const { data: productData, isLoading } = useGetProductsForFiltersQuery(queryParams);
  const products = productData?.data || [];
  const meta = productData?.meta;

  const toggleBrand = (id: string) =>
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );

  const handleCatChange = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set("category", id);
    } else {
      params.delete("category");
    }
    router.push(`/shop?${params.toString()}`);
    setSelectedBrands([]);
    setPage(1);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    router.push(`/shop?${params.toString()}`);
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(0);
    setActiveRating(0);
    setSort("default");
    setPage(1);
  };

  const activeCatName = categories.find((c) => c.id === activeCat)?.name;

  const activeTags = [
    activeCat && { label: activeCatName, clear: () => handleCatChange("") },
    ...selectedBrands.map((id) => {
      const b = brands.find((br) => br.id === id);
      return b ? { label: b.name, clear: () => toggleBrand(id) } : null;
    }).filter(Boolean),
    (minPrice > 0 || maxPrice > 0) && {
      label: `৳${minPrice}–৳${maxPrice}`,
      clear: () => { setMinPrice(0); setMaxPrice(0); },
    },
    activeRating > 0 && {
      label: `${activeRating}★+`,
      clear: () => setActiveRating(0),
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const filterProps = {
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
    onClearAll: clearAll,
  };

  return (
    <section className="min-h-screen bg-[#f8fafc] py-6 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-[1276px]">
        {/* Page Top Header Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Store className="w-3.5 h-3.5 text-brand" />
              <span>হোম / শপ{activeCatName ? ` / ${activeCatName}` : ""}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              {activeCatName || (search ? `সার্চ ফলাফল: "${search}"` : "সকল প্রডাক্ট")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              মোট {meta?.total ?? products.length} টি পণ্য পাওয়া গেছে
            </p>
          </div>

          {/* Sort & Mobile Filter Actions */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Mobile filter sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs transition-colors hover:border-brand cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-brand" />
                  <span>ফিল্টার</span>
                  {activeTags.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-brand text-brand-foreground text-[10px] flex items-center justify-center">
                      {activeTags.length}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 px-5 pt-10 overflow-y-auto bg-white border-r border-slate-200">
                <FilterSidebar {...filterProps} />
              </SheetContent>
            </Sheet>

            {/* Sort Select */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="text-xs sm:text-sm px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:outline-hidden focus:border-brand cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-6 items-start">
          {/* Desktop Left Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 bg-white border border-slate-200 rounded-2xl p-5 sticky top-20">
            <FilterSidebar {...filterProps} />
          </aside>

          {/* Right Product Grid Area */}
          <div className="flex-1 min-w-0">
            {/* Active filter pills */}
            {activeTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-4 bg-white border border-slate-200 rounded-xl p-3">
                <span className="text-xs font-semibold text-slate-500 mr-1">
                  ফিল্টারসমূহ:
                </span>
                {activeTags.map((tag, i) => (
                  <span
                    key={i}
                    onClick={tag.clear}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-light text-brand border border-brand-border cursor-pointer hover:opacity-90 transition-colors"
                  >
                    <span>{tag.label}</span>
                    <X className="w-3 h-3 text-brand hover:opacity-75" />
                  </span>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-slate-400 hover:text-rose-600 transition-colors underline underline-offset-2 ml-auto cursor-pointer"
                >
                  সব মুছুন
                </button>
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-72 rounded-xl bg-white border border-slate-200 animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl text-center py-16 px-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Filter className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base text-slate-800">
                  কোনো পণ্য পাওয়া যায়নি
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  অন্য কোনো ক্যাটাগরি বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-slate-200 hover:border-brand hover:text-brand rounded-xl text-xs h-9 px-4"
                  onClick={clearAll}
                >
                  সকল ফিল্টার রিসেট করুন
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Modern Numbered / Pagination Controls */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 bg-white border border-slate-200 rounded-2xl p-3">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>পূর্ববর্তী</span>
                    </button>

                    <span className="text-xs font-semibold text-slate-500 px-3">
                      পৃষ্ঠা {page} / {meta.totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={page === meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <span>পরবর্তী</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
