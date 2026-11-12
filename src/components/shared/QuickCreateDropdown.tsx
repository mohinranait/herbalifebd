"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  FolderPlus,
  HelpCircle,
  ImagePlus,
  Layers,
  PackagePlus,
  Plus,
  Receipt,
  Sparkles,
  Tag,
  UserPlus,
} from "lucide-react";

interface CreateItem {
  title: string;
  subtitle: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  badge?: string;
}

const catalogActions: CreateItem[] = [
  {
    title: "New Product",
    subtitle: "Add product to catalog",
    url: "/admin/products/form",
    icon: PackagePlus,
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-200/50",
    badge: "New",
  },
  {
    title: "Category",
    subtitle: "Product categories",
    url: "/admin/categories",
    icon: FolderPlus,
    iconBg: "bg-blue-50 text-blue-600 border border-blue-200/50",
  },
  {
    title: "Brand",
    subtitle: "Brand partners",
    url: "/admin/brands",
    icon: Tag,
    iconBg: "bg-violet-50 text-violet-600 border border-violet-200/50",
  },
  {
    title: "Attribute",
    subtitle: "Sizes & variations",
    url: "/admin/attributes",
    icon: Layers,
    iconBg: "bg-amber-50 text-amber-600 border border-amber-200/50",
  },
];

const generalActions: CreateItem[] = [
  {
    title: "Record Expense",
    subtitle: "Log shop expenses",
    url: "/admin/accounts/expenses",
    icon: Receipt,
    iconBg: "bg-rose-50 text-rose-600 border border-rose-200/50",
  },
  {
    title: "Hero Slider",
    subtitle: "Homepage banner",
    url: "/admin/sliders",
    icon: ImagePlus,
    iconBg: "bg-sky-50 text-sky-600 border border-sky-200/50",
  },
  {
    title: "Site Content",
    subtitle: "Banners & sections",
    url: "/admin/site-content",
    icon: Sparkles,
    iconBg: "bg-pink-50 text-pink-600 border border-pink-200/50",
  },
  {
    title: "FAQ Question",
    subtitle: "Customer Q&A",
    url: "/admin/faqs",
    icon: HelpCircle,
    iconBg: "bg-teal-50 text-teal-600 border border-teal-200/50",
  },
  {
    title: "User / Staff",
    subtitle: "Customer or admin",
    url: "/admin/users",
    icon: UserPlus,
    iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-200/50",
  },
];

export function QuickCreateDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          className="h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer"
        >
          <Plus className="size-3.5 stroke-[2.5]" />
          <span className="font-semibold tracking-wide">Create</span>
          <ChevronDown className="size-3 opacity-80" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-64 rounded-xl p-1.5 shadow-xl border border-zinc-200 bg-white text-zinc-900 z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
      >
        {/* Header */}
        <div className="px-2 py-1 flex items-center justify-between border-b border-zinc-100 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Create New
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">Quick link</span>
        </div>

        {/* Scrollable list container */}
        <div className="max-h-64 sm:max-h-72 overflow-y-auto pr-0.5 space-y-2">
          {/* Group 1: Catalog */}
          <div>
            <div className="px-2 py-0.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Catalog
            </div>
            <DropdownMenuGroup className="space-y-0.5 mt-0.5">
              {catalogActions.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.url + item.title}
                    asChild
                    className="cursor-pointer p-0 rounded-lg focus:bg-zinc-100 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-2.5 px-2 py-1.5 w-full group rounded-lg hover:bg-zinc-50"
                    >
                      <div
                        className={`flex items-center justify-center size-7 rounded-md ${item.iconBg} shrink-0 transition-transform group-hover:scale-105`}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-xs text-zinc-900 group-hover:text-emerald-700 transition-colors truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate leading-tight">
                          {item.subtitle}
                        </p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </div>

          <DropdownMenuSeparator className="my-1 bg-zinc-100" />

          {/* Group 2: Management */}
          <div>
            <div className="px-2 py-0.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Management & Marketing
            </div>
            <DropdownMenuGroup className="space-y-0.5 mt-0.5">
              {generalActions.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.url + item.title}
                    asChild
                    className="cursor-pointer p-0 rounded-lg focus:bg-zinc-100 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-2.5 px-2 py-1.5 w-full group rounded-lg hover:bg-zinc-50"
                    >
                      <div
                        className={`flex items-center justify-center size-7 rounded-md ${item.iconBg} shrink-0 transition-transform group-hover:scale-105`}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-xs text-zinc-900 group-hover:text-emerald-700 transition-colors block truncate">
                          {item.title}
                        </span>
                        <p className="text-[10px] text-zinc-400 truncate leading-tight">
                          {item.subtitle}
                        </p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default QuickCreateDropdown;
