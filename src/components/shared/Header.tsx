"use client";

import { useState } from "react";
import { Search, User, ShoppingBag, ChevronDown, Zap } from "lucide-react";
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

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAppSelector((state) => state.auth);
  const { totalItems, subtotal } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { data: categoryData } = useGetCategoriesQuery("status=true&isDelete=false");
  const categories = categoryData?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      {/* 1. Top Announcement Bar - Not sticky, scrolls away naturally */}
      <MarqueText />

      {/* 2. Main Sticky Header - Sticks to top:0 for the entire page scroll */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-2.5 md:py-3">
          <div className="flex items-center justify-between gap-4 md:gap-6">
            {/* Mobile: Hamburger & Logo */}
            <div className="flex items-center gap-2 md:hidden">
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
                      className="flex items-center gap-1.5 hover:text-orange-600 transition-colors cursor-pointer py-1 outline-hidden"
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
                      <DropdownMenuItem key={cat._id} asChild>
                        <Link
                          href={`/shop?category=${cat._id}`}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-md cursor-pointer transition-colors"
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
                        className="block text-center text-xs font-semibold text-orange-600 hover:underline py-1"
                      >
                        সব ক্যাটাগরি দেখুন →
                      </Link>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Flash Sale */}
                <Link
                  href="/offers"
                  className="flex items-center gap-1 hover:text-orange-600 transition-colors"
                >
                  <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span>ফ্ল্যাশ সেল</span>
                </Link>

                {/* All Products */}
                <Link
                  href="/shop"
                  className="hover:text-orange-600 transition-colors"
                >
                  সকল প্রডাক্ট
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
                  placeholder="আপনার কাঙ্খিত পণ্য সার্চ করুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 border-r-0 rounded-l-lg focus:outline-hidden focus:bg-white focus:border-orange-500 text-slate-800 placeholder:text-slate-400 transition-colors"
                />
                <button
                  type="submit"
                  className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-r-lg flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              {/* User Account / Login */}
              {user?._id ? (
                <button
                  type="button"
                  onClick={() => router.push(user?.role === 'Admin' ? '/admin' : '/dashboard')}
                  className="flex items-center gap-2 w-11 h-11 px-3 uppercase justify-center text-3xl rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 md:text-sm font-medium transition-colors cursor-pointer"
                >
                 
                    {user?.name[0]?.toUpperCase()}
             
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => dispatch(setLoginModalOpen({ isOpen: true }))}
                  className="flex items-center gap-2 w-11 h-11 px-3.5 rounded-full border border-slate-200 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/50 text-slate-700 text-xs md:text-sm font-medium transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-500" />
                 
                </button>
              )}

              {/* Cart Button */}
              <button
                type="button"
                onClick={() => dispatch(toggleCartDroware())}
                aria-label="Shopping Cart"
                className="relative h-11 w-11 rounded-full border border-slate-200 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/50 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Row */}
          <form onSubmit={handleSearch} className="md:hidden mt-2.5">
            <div className="flex w-full">
              <input
                type="text"
                placeholder="আপনার কাঙ্খিত পণ্য সার্চ করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 border-r-0 rounded-l-md focus:outline-hidden text-slate-800"
              />
              <button
                type="submit"
                className="h-9 px-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-r-md flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>
      </header>

      <LoginModal />
    </>
  );
}
