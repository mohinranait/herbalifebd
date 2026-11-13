"use client";

import { useState, useRef, useEffect } from "react";
import { Search, User, ShoppingBag, ChevronDown, Zap, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { setLoginModalOpen } from "@/redux/features/uiSlice";
import LoginModal from "./login-modal";
import { toggleCartDroware } from "@/redux/features/cartSlice";
import { useGetCategoriesQuery } from "@/redux/service/categories";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MobileMenu } from "./MobileMenu";
import HeaderLogo from "./HeaderLogo";
import MarqueText from "./MarqueText";
import Link from "next/link";
import Image from "next/image";
import { PRODUCT_IMG } from "@/lib/default-import";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

export default function Header() {
  const t = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAppSelector((state) => state.auth);
  const { totalItems } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { data: categoryData } = useGetCategoriesQuery("status=true&isDelete=false");
  const categories = categoryData?.data || [];

  // Focus input when mobile search is opened
  useEffect(() => {
    if (isMobileSearchOpen) {
      mobileInputRef.current?.focus();
    }
  }, [isMobileSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <>
      {/* 1. Top Announcement Bar - Not sticky, scrolls away naturally */}
      <MarqueText />

      {/* 2. Main Sticky Header - Sticks to top:0 for the entire page scroll */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-2xs">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 md:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
            {/* Mobile: Hamburger & Logo */}
            <div className="flex items-center gap-2 sm:gap-3 md:hidden">
              <MobileMenu />
              <HeaderLogo />
            </div>

            {/* Desktop Left: Logo & Simple Clean Navigation */}
            <div className="hidden md:flex items-center gap-6 shrink-0">
              <HeaderLogo />

              <nav className="flex items-center gap-5 text-sm font-medium text-slate-700">
                {/* Category Dropdown */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 hover:text-brand transition-colors cursor-pointer py-1 outline-hidden"
                    >
                      <span>ক্যাটাগরি</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-56 max-h-80 overflow-y-auto p-1.5 bg-white border border-slate-200 rounded-lg z-50"
                  >
                    {categories.map((cat) => (
                      <DropdownMenuItem key={cat.id} asChild>
                        <Link
                          href={`/shop?category=${cat.id}`}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:text-brand hover:bg-brand-light rounded-md cursor-pointer transition-colors"
                        >
                          <div className="w-5 h-5 rounded overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                            <Image
                              src={cat.thumbnail || `/${PRODUCT_IMG}`}
                              alt={cat.name}
                              width={20}
                              height={20}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="line-clamp-1">{cat.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <div className="p-1 border-t border-slate-100 mt-1">
                      <Link
                        href="/categories"
                        className="block text-center text-xs font-semibold text-brand hover:underline py-1"
                      >
                        সব ক্যাটাগরি দেখুন →
                      </Link>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Flash Sale */}
                <Link
                  href="/offers"
                  className="flex items-center gap-1 hover:text-brand transition-colors"
                >
                  <Zap className="w-4 h-4 text-brand fill-brand" />
                  <span>{t["flash-sale"] || "ফ্ল্যাশ সেল"}</span>
                </Link>

                {/* All Products */}
                <Link
                  href="/shop"
                  className="hover:text-brand transition-colors"
                >
                  {t["all-products-title"] || "সকল প্রডাক্ট"}
                </Link>
              </nav>
            </div>

            {/* Desktop Center: Simple Clean Search Bar */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-2"
            >
              <div className="flex w-full items-center">
                <input
                  type="text"
                  placeholder={t["search-placeholder"] || "আপনার কাঙ্খিত পণ্য সার্চ করুন..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 border-r-0 rounded-l-lg focus:outline-hidden focus:bg-white focus:border-brand text-slate-800 placeholder:text-slate-400 transition-colors"
                />
                <button
                  type="submit"
                  className="h-10 px-4 bg-brand hover:bg-brand-hover text-brand-foreground rounded-r-lg flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen((prev) => !prev)}
                aria-label="সার্চ অপশন খুলুন"
                className={cn(
                  "relative h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-slate-200 hover:border-brand hover:text-brand hover:bg-brand-light text-slate-700 flex items-center justify-center transition-all cursor-pointer md:hidden shadow-2xs active:scale-95",
                  isMobileSearchOpen &&
                    "bg-brand-light border-brand text-brand ring-2 ring-brand/30"
                )}
              >
                {isMobileSearchOpen ? (
                  <X className="h-4.5 w-4.5" />
                ) : (
                  <Search className="h-4.5 w-4.5" />
                )}
              </button>

              {/* User Account / Login */}
              {user?.id ? (
                <button
                  type="button"
                  onClick={() =>
                    router.push(user?.role === "Admin" ? "/admin" : "/dashboard")
                  }
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 uppercase text-sm font-bold rounded-full border border-slate-200 hover:border-brand hover:bg-brand-light hover:text-brand text-slate-700 transition-colors cursor-pointer shadow-2xs active:scale-95"
                >
                  {user?.name?.[0]?.toUpperCase()}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => dispatch(setLoginModalOpen({ isOpen: true }))}
                  aria-label="লগইন করুন"
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-200 hover:border-brand hover:text-brand hover:bg-brand-light text-slate-700 transition-colors cursor-pointer shadow-2xs active:scale-95"
                >
                  <User className="w-4.5 h-4.5 text-slate-600" />
                </button>
              )}

              {/* Cart Button */}
              <button
                type="button"
                onClick={() => dispatch(toggleCartDroware())}
                aria-label="শপিং ব্যাগ"
                className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-slate-200 hover:border-brand hover:text-brand hover:bg-brand-light text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs active:scale-95"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand text-brand-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Collapsible Search Row */}
          {isMobileSearchOpen && (
            <div className="md:hidden pt-2.5 pb-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <form onSubmit={handleSearch} className="relative flex items-center w-full">
                <input
                  ref={mobileInputRef}
                  type="text"
                  placeholder={t["search-placeholder"] || "আপনার কাঙ্খিত পণ্য সার্চ করুন..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-3.5 pr-20 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-brand text-slate-800 placeholder:text-slate-400 transition-all shadow-xs"
                />
                <div className="absolute right-1 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                      aria-label="ক্লিয়ার করুন"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="h-8 px-3 bg-brand hover:bg-brand-hover text-brand-foreground rounded-md flex items-center justify-center transition-colors cursor-pointer text-xs font-medium gap-1 shadow-xs"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>খুঁজুন</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </header>

      <LoginModal />
    </>
  );
}
