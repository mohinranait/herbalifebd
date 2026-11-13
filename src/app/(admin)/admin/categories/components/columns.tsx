"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Folder, Package, ExternalLink, Hash } from "lucide-react";
import GetDateFormate from "@/components/shared/GetDateFormate";
import { Badge } from "@/components/ui/badge";
import { ICategory } from "@/redux/service/categories/type";
import CellAction from "./CellAction";

interface ColumnsProps {
  type: "active" | "deleted";
  categoriesMap?: Map<string, string>;
}

export const tableColumns = ({ type = "active", categoriesMap }: ColumnsProps) => {
  const columns: ColumnDef<ICategory>[] = [
    {
      accessorKey: "name",
      header: "Category",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Folder className="w-4 h-4 text-slate-400" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                  {item.name}
                </span>
                <Link
                  href={`/shop?category=${item.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-orange-500 transition-colors"
                  title="View on Storefront"
                >
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  /{item.slug}
                </span>
                {item.priority !== undefined && item.priority > 0 && (
                  <span className="text-[10px] text-slate-400 flex items-center">
                    <Hash className="w-2.5 h-2.5" />
                    {item.priority}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "parentId",
      header: "Hierarchy",
      cell: ({ row }) => {
        const item = row.original;
        const parentName = item.parentId && categoriesMap ? categoriesMap.get(item.parentId) : null;

        if (!item.parentId) {
          return (
            <Badge
              variant="outline"
              className="text-[11px] font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200/70 dark:border-blue-800/60"
            >
              Root Category
            </Badge>
          );
        }

        return (
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              ↳ {parentName || "Subcategory"}
            </span>
            <span className="text-[10px] text-slate-400">Level {item.level ?? 1}</span>
          </div>
        );
      },
    },

    {
      accessorKey: "totalProducts",
      header: "Products",
      cell: ({ row }) => {
        const count = row.original.totalProducts ?? 0;
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            <span>{count} items</span>
          </div>
        );
      },
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isAct = row.original.status;
        return (
          <span
            className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isAct
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/60"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/70 dark:border-rose-800/60"
            }`}
          >
            {isAct ? "Active" : "Inactive"}
          </span>
        );
      },
    },

    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => {
        return (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            <GetDateFormate date={row.original.createdAt} />
          </span>
        );
      },
    },

    {
      id: "actions",
      header: () => <div className="text-right pr-2">Actions</div>,
      enableSorting: false,
      cell: ({ row }) => <CellAction data={row.original} type={type} />,
    },
  ];

  return columns;
};

export default tableColumns;
