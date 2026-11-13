"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  Image as LucidImage,
  Star,
  ExternalLink,
  Layers,
  Sparkles,
  Truck,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GetDateFormate from "@/components/shared/GetDateFormate";
import CellAction from "./CellAction";
import { IProduct } from "@/redux/service/products/type";
import findProductImage from "@/hooks/useFindProductImage";
import { CURRENCY } from "@/lib/envSecret";
import { showTwoDecimals } from "@/lib/helpers";
import { getPriceRange, getSingleProductPrice } from "@/hooks/useGerPrice";

interface TableColumnsProps {
  type?: "active" | "deleted";
}

const tableColumns = ({ type = "active" }: TableColumnsProps) => {
  const columns: ColumnDef<IProduct>[] = [
    {
      accessorKey: "name",
      header: "Product Details",
      cell: ({ row }) => {
        const product = row.original;
        const prodImage = findProductImage({ product });
        const isVariant = product.productType === "variant";
        const variantCount = product.variations?.length || 0;

        return (
          <div className="flex items-center gap-3 py-1">
            <div className="relative w-11 h-11 rounded-md overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
              {prodImage ? (
                <Image
                  src={prodImage}
                  alt={product.name || "Product"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <LucidImage className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="space-y-1 min-w-0 max-w-[280px]">
              <Link
                href={`/product/${product.slug || product.id}`}
                target="_blank"
                className="group inline-flex items-center gap-1 font-semibold text-xs text-slate-900 hover:text-primary transition-colors line-clamp-1"
                title={product.name}
              >
                <span>{product.name}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {product.category?.name && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {product.category.name}
                  </span>
                )}

                {product.brand?.name && (
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium">
                    {product.brand.name}
                  </span>
                )}

                {isVariant ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 font-medium text-[10px]">
                    <Layers className="w-3 h-3" />
                    <span>{variantCount} Variants</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">
                    Single Item
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const product = row.original;
        const isSingle = product.productType === "single";

        if (isSingle) {
          const singlePrice = getSingleProductPrice(product);
          const hasDiscount = (product.discountPrice || 0) > 0;
          const finalPrice = singlePrice?.finalPrice ?? (product.price || 0);

          return (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">
                  ৳{finalPrice.toLocaleString("en-IN")}
                </span>
                {hasDiscount && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 px-1 py-0"
                  >
                    -{product.discountParcent || 0}%
                  </Badge>
                )}
              </div>
              {hasDiscount && (
                <span className="text-[11px] text-slate-400 line-through block">
                  ৳{(product.price || 0).toLocaleString("en-IN")}
                </span>
              )}
            </div>
          );
        }

        // Variant product price range
        const priceRange = getPriceRange(product);
        return (
          <div>
            <span className="text-xs font-bold text-slate-900">{priceRange}</span>
            <p className="text-[10px] text-slate-400">Variant-based</p>
          </div>
        );
      },
    },

    {
      accessorKey: "stock",
      header: "Inventory",
      cell: ({ row }) => {
        const stock = row.original.stock ?? 0;
        const isVariant = row.original.productType === "variant";

        if (stock <= 0) {
          return (
            <div className="space-y-0.5">
              <Badge
                variant="outline"
                className="bg-red-50 text-red-600 border-red-200 rounded text-[11px] font-semibold"
              >
                Out of Stock (0)
              </Badge>
            </div>
          );
        }

        if (stock <= 10) {
          return (
            <div className="space-y-0.5">
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200 rounded text-[11px] font-semibold"
              >
                Low Stock: {stock}
              </Badge>
              {isVariant && <p className="text-[10px] text-slate-400">Total variants stock</p>}
            </div>
          );
        }

        return (
          <div className="space-y-0.5">
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded text-[11px] font-semibold"
            >
              In Stock ({stock})
            </Badge>
            {isVariant && <p className="text-[10px] text-slate-400">Total variants stock</p>}
          </div>
        );
      },
    },

    {
      accessorKey: "performance",
      header: "Sales & Reviews",
      cell: ({ row }) => {
        const sold = row.original.totalSold || 0;
        const rating = row.original.ratingsAverage;
        const reviewCount = row.original.totalReviews || 0;

        return (
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span>{sold} sold</span>
            </div>

            {rating && rating > 0 ? (
              <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({reviewCount})</span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400">No reviews</span>
            )}
          </div>
        );
      },
    },

    {
      accessorKey: "status",
      header: "Status & Flags",
      cell: ({ row }) => {
        const product = row.original;
        const isActive = Boolean(product.status);
        const isFeatured = Boolean(product.isFeatured);
        const isFreeShipping = Boolean(product.isFreeShipping);

        return (
          <div className="flex flex-col items-start gap-1">
            <Badge
              variant="outline"
              className={`rounded text-[11px] font-semibold ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {isActive ? "Active" : "Draft (Inactive)"}
            </Badge>

            <div className="flex flex-wrap gap-1">
              {isFeatured && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Featured
                </span>
              )}

              {isFreeShipping && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  <Truck className="w-3 h-3" />
                  Free Ship
                </span>
              )}
            </div>
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
      cell: ({ row }) => <CellAction data={row.original} type={type} />,
    },
  ];

  return columns;
};

export default tableColumns;
