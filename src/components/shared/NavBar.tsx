"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  ExternalLink,
  Home,
  Search,
  Store,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProfileDropdown } from "./ProfileDropdown";
import NotificationDropdown from "./NotificationDropdown";
import ThemeButton from "./ThemeButton";
import QuickCreateDropdown from "./QuickCreateDropdown";

interface HeaderProps {
  fixed?: boolean;
  children?: ReactNode;
  titleIcon?: ReactNode;
  className?: string;
}

const segmentLabels: Record<string, string> = {
  admin: "Dashboard",
  products: "Products",
  form: "Form",
  categories: "Categories",
  brands: "Brands",
  attributes: "Attributes",
  "request-quotes": "Request Quotes",
  comments: "Reviews",
  orders: "Orders",
  accounts: "Accounts",
  "profit-loss": "Profit & Loss",
  expenses: "Expenses",
  users: "Users",
  media: "Media",
  sliders: "Sliders",
  "contact-query": "Contact Inquiries",
  faqs: "FAQs",
  setting: "Settings",
  "site-content": "Site Content",
  configure: "Configurations",
};

export const Navbar = ({
  className,
  fixed = true,
  children,
  ...props
}: HeaderProps) => {
  const [offset, setOffset] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };

    document.addEventListener("scroll", onScroll, { passive: true });
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  // Generate dynamic breadcrumb segments
  const pathSegments = pathname
    ? pathname.split("/").filter((segment) => segment.length > 0)
    : [];

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6",
        "bg-white/95 backdrop-blur-md border-b border-border/80 transition-all duration-200",
        offset > 10 ? "shadow-xs border-border" : "shadow-none",
        className
      )}
      {...props}
    >
      {/* Left: Sidebar Toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0 shrink-0">
        <SidebarTrigger
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg border border-border/50 hover:bg-accent/80 hover:border-border text-foreground transition-all duration-150 shrink-0"
        />

        <div className="h-5 w-px bg-border/60 hidden sm:block shrink-0" />

        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground truncate"
        >
          <Link
            href="/admin"
            className="flex items-center gap-1 hover:text-foreground transition-colors font-medium text-foreground/80"
            title="Dashboard Home"
          >
            <Home className="size-3.5" />
            <span>Admin</span>
          </Link>

          {pathSegments.length > 1 &&
            pathSegments.slice(1).map((seg, idx) => {
              const isLast = idx === pathSegments.length - 2;
              const pathUrl = `/${pathSegments.slice(0, idx + 2).join("/")}`;
              const label = segmentLabels[seg] || seg.replace(/-/g, " ");

              return (
                <React.Fragment key={pathUrl}>
                  <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
                  {isLast ? (
                    <span className="font-semibold text-foreground truncate capitalize">
                      {label}
                    </span>
                  ) : (
                    <Link
                      href={pathUrl}
                      className="hover:text-foreground transition-colors capitalize truncate"
                    >
                      {label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
        </nav>
      </div>

      {/* Center: Quick Search Trigger Button */}
      <div className="hidden lg:flex items-center max-w-xs xl:max-w-sm flex-1 mx-2 xl:mx-4">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 h-9 px-3 rounded-lg border border-border/60 bg-accent/30 hover:bg-accent/70 text-xs text-muted-foreground transition-all duration-150 group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            <span className="truncate">Search products, orders...</span>
          </div>
          <kbd className="hidden xl:inline-flex items-center gap-0.5 rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-2xs shrink-0">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Create, Quick Store Link, Notifications, Theme, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Quick Create Dropdown Button */}
        <QuickCreateDropdown />

        {/* Live Storefront Button */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="hidden md:inline-flex items-center gap-1.5 h-9 rounded-lg border-border/70 hover:bg-accent/80 text-xs font-medium"
        >
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <Store className="size-3.5 text-primary" />
            <span>Live Store</span>
            <ExternalLink className="size-3 text-muted-foreground opacity-60" />
          </Link>
        </Button>

        {/* Theme Toggle Button */}
        <div className="flex items-center">
          <ThemeButton />
        </div>

        {/* Notifications Dropdown */}
        <div className="flex items-center">
          <NotificationDropdown />
        </div>

        <div className="h-5 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
};

Navbar.displayName = "Navbar";
export default Navbar;
