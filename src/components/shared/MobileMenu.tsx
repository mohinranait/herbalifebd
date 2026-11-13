"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  Home,
  Store,
  Zap,
  Gift,
  Dices,
  Truck,
  Phone,
  HelpCircle,
  Package,
  LayoutDashboard,
  LogIn,
  ChevronRight,
  PhoneCall,
  Grid,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import HeaderLogo from "./HeaderLogo";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { setLoginModalOpen } from "@/redux/features/uiSlice";
import { useGetCategoriesQuery } from "@/redux/service/categories";
import { useGetAppSettingQuery } from "@/redux/service/setting";
import { PRODUCT_IMG } from "@/lib/default-import";
import WhatsAppIcon from "../svg/WhatsApp";
import { formatWhatsappNumber } from "./WhatsAppButton";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"menu" | "categories">("menu");

  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const { data: categoryData } = useGetCategoriesQuery("status=true&isDelete=false");
  const categories = categoryData?.data || [];

  const { data: appSetting } = useGetAppSettingQuery();

  const close = () => setOpen(false);

  const handleOpenLogin = () => {
    close();
    dispatch(setLoginModalOpen({ isOpen: true }));
  };

  const navMenuItems = [
    {
      href: "/",
      label: "হোম পেজ",
      icon: Home,
      badge: null,
    },
    {
      href: "/shop",
      label: "সকল প্রডাক্ট",
      icon: Store,
      badge: null,
    },
    {
      href: "/offers",
      label: "ফ্ল্যাশ সেল ও অফার",
      icon: Zap,
      badge: "হট ডিল 🔥",
      badgeColor: "bg-orange-500 text-white",
    },
    {
      href: "/brands",
      label: "ব্র্যান্ড সমূহ",
      icon: Dices,
      badge: null,
    },
    {
      href: "/free-shipping",
      label: "ফ্রি শিপিং অফার",
      icon: Truck,
      badge: "ফ্রি",
      badgeColor: "bg-emerald-50 text-emerald-600 font-semibold border border-emerald-200",
    },
    {
      href: "/contact-us",
      label: "যোগাযোগ",
      icon: Phone,
      badge: null,
    },
  ];

  const userMenuItems = [
    {
      href: user?.role === "Admin" ? "/admin" : "/dashboard",
      label: user?.role === "Admin" ? "অ্যাডমিন প্যানেল" : "ড্যাশবোর্ড",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/orders",
      label: "আমার অর্ডার সমূহ",
      icon: Package,
    },
    {
      href: "/faqs",
      label: "সচরাচর প্রশ্ন (FAQs)",
      icon: HelpCircle,
    },
  ];

  return (
    <div className="flex items-center md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        {/* Modern Customized Hamburger Button */}
        <SheetTrigger asChild>
          <button
            type="button"
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-600 text-slate-700 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 group shrink-0"
            aria-label="মেনু খুলুন"
          >
            <span className="w-5 h-[2px] bg-slate-700 rounded-full group-hover:bg-orange-600 transition-colors" />
            <span className="w-3.5 h-[2px] bg-slate-700 rounded-full group-hover:bg-orange-600 group-hover:w-5 transition-all self-start ml-2.5" />
            <span className="w-5 h-[2px] bg-slate-700 rounded-full group-hover:bg-orange-600 transition-colors" />
          </button>
        </SheetTrigger>

        {/* Drawer Content */}
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[85vw] max-w-[340px] p-0 flex flex-col h-full bg-white border-r border-slate-200 shadow-2xl overflow-hidden"
        >
          {/* Drawer Header */}
          <SheetHeader className="px-4 py-3 border-b border-slate-100 bg-linear-to-r from-orange-50/70 via-white to-amber-50/40 flex-row items-center justify-between shrink-0">
            <SheetTitle className="text-left">
              <HeaderLogo />
            </SheetTitle>
            <button
              type="button"
              onClick={close}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              aria-label="মেনু বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </SheetHeader>

          {/* User Account / Welcome Banner */}
          <div className="px-3 pt-3 shrink-0">
            {user?._id ? (
              <div className="bg-linear-to-r from-orange-50/90 to-amber-50/70 border border-orange-200/80 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-500 to-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0 uppercase">
                    {user?.name?.[0] || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 leading-none">স্বাগতম</p>
                    <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                      {user.name}
                    </p>
                  </div>
                </div>
                <Link
                  href={user?.role === "Admin" ? "/admin" : "/dashboard"}
                  onClick={close}
                  className="text-[11px] font-semibold text-orange-600 bg-white hover:bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 transition-colors shrink-0"
                >
                  প্রোফাইল
                </Link>
              </div>
            ) : (
              <div className="bg-linear-to-r from-orange-50/90 to-amber-50/60 border border-orange-200/70 rounded-xl p-3">
                <p className="text-xs text-slate-700 font-medium">
                  স্বাগতম! দ্রুত কেনাকাটা করতে সাইন ইন করুন
                </p>
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="mt-2 w-full h-8.5 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>লগইন / রেজিস্টার করুন</span>
                </button>
              </div>
            )}
          </div>

          {/* Modern Tab Bar: Menu vs Categories */}
          <div className="px-3 pt-3 shrink-0">
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("menu")}
                className={cn(
                  "py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  activeTab === "menu"
                    ? "bg-white text-orange-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>মেনু</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("categories")}
                className={cn(
                  "py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  activeTab === "categories"
                    ? "bg-white text-orange-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <span>ক্যাটাগরি ({categories.length})</span>
              </button>
            </div>
          </div>

          {/* Scrollable Navigation Area */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {activeTab === "menu" ? (
              <div className="space-y-4">
                {/* Main Navigation Links */}
                <div>
                  <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-2 mb-1.5">
                    ন্যাভিগেশন
                  </p>
                  <nav className="flex flex-col gap-1">
                    {navMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={close}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-orange-50/60 active:bg-orange-100/50 text-slate-700 hover:text-orange-600 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-orange-100 text-slate-600 group-hover:text-orange-600 flex items-center justify-center transition-colors">
                              <Icon className="w-4 h-4" />
                            </span>
                            <span className="text-xs sm:text-sm font-medium">
                              {item.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span
                                className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-md",
                                  item.badgeColor
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Account & Help */}
                <div>
                  <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-2 mb-1.5">
                    অ্যাকাউন্ট ও সহায়তা
                  </p>
                  <nav className="flex flex-col gap-1">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={close}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100/70 text-slate-700 hover:text-slate-900 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                              <Icon className="w-4 h-4" />
                            </span>
                            <span className="text-xs sm:text-sm font-medium">
                              {item.label}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            ) : (
              /* Categories List */
              <div>
                <nav className="flex flex-col gap-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      href={`/shop?category=${cat._id}`}
                      onClick={close}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-orange-50/60 text-slate-700 hover:text-orange-600 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0">
                          <Image
                            src={cat.thumbnail || `/${PRODUCT_IMG}`}
                            alt={cat.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-medium truncate">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {cat.totalProducts !== undefined && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {cat.totalProducts}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </nav>

                <div className="p-2 border-t border-slate-100 mt-2">
                  <Link
                    href="/categories"
                    onClick={close}
                    className="block text-center text-xs font-semibold text-orange-600 hover:text-orange-700 py-1.5 bg-orange-50/70 hover:bg-orange-100/70 rounded-lg transition-colors"
                  >
                    সকল ক্যাটাগরি পেজ দেখুন →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Support Footer */}
          <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/80 shrink-0">
            <p className="text-[11px] text-slate-500 font-medium mb-2">
              যেকোনো সহায়তায় আমাদের সাথে যোগাযোগ করুন:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {appSetting?.contactPhone && (
                <a
                  href={`tel:${appSetting.contactPhone}`}
                  className="flex items-center justify-center gap-1.5 h-8.5 rounded-lg border border-slate-200 bg-white hover:border-orange-300 hover:text-orange-600 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-orange-500" />
                  <span>কল করুন</span>
                </a>
              )}
              {appSetting?.contactPhone && (
                <a
                  href={`https://wa.me/${formatWhatsappNumber(appSetting.contactPhone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 h-8.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white" />
                  <span>হোয়াটসঅ্যাপ</span>
                </a>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileMenu;
