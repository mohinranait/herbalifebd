"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Star, ExternalLink, User, MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GetDateFormate from "@/components/shared/GetDateFormate";
import CellAction from "./CellAction";
import { IComment } from "@/redux/service/comments/type";

export const tableColumns: ColumnDef<IComment>[] = [
  {
    accessorKey: "user",
    header: "Reviewer",
    cell: ({ row }) => {
      const user = row.original.user;

      return (
        <div className="flex items-center gap-2.5 py-1 min-w-[160px]">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.name || "Customer"}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {user?.phone || user?.email || "No contact"}
            </p>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => {
      const product = row.original.product;
      const thumbnail = product?.thumbnail;
      const slug = product?.slug;

      return (
        <div className="flex items-center gap-2.5 py-1 min-w-[200px] max-w-[260px]">
          <div className="relative w-9 h-9 rounded-md overflow-hidden border border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={product?.name || "Product"}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-[10px] text-slate-400">No img</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {slug ? (
              <Link
                href={`/product/${slug}`}
                target="_blank"
                className="group inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-orange-600 transition-colors line-clamp-1"
                title={product?.name}
              >
                <span className="truncate">{product?.name || "Product"}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            ) : (
              <p className="text-xs font-semibold text-slate-900 truncate">
                {product?.name || "Product"}
              </p>
            )}
            <p className="text-[10px] text-slate-400 truncate">
              ID: {typeof row.original.productId === "object" ? row.original.productId?.id : (row.original.productId || "N/A")}
            </p>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.original.rating || 0;

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-100 text-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-700">
            {rating} of 5.0
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "comment",
    header: "Review Comment",
    cell: ({ row }) => {
      const comment = row.original.comment;

      return (
        <div className="max-w-[320px] py-1">
          <div className="p-2 rounded-md bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed line-clamp-2">
            &ldquo;{comment}&rdquo;
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "isApproved",
    header: "Approval Status",
    cell: ({ row }) => {
      const isApproved = Boolean(row.original.isApproved);
      const isFeature = Boolean(row.original.isFeature);

      return (
        <div className="flex flex-col items-start gap-1">
          <Badge
            variant="outline"
            className={`rounded text-[11px] font-semibold ${
              isApproved
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {isApproved ? "Approved" : "Pending"}
          </Badge>

          {isFeature && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
              <Sparkles className="w-3 h-3 text-purple-500" />
              Featured
            </span>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return (
        <div className="text-xs text-slate-500">
          <GetDateFormate date={row.original.createdAt} />
        </div>
      );
    },
  },

  {
    id: "actions",
    header: () => <div className="text-right pr-2">Actions</div>,
    enableSorting: false,
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];

export default tableColumns;
