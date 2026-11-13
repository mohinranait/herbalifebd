"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Package, AlertTriangle, Sparkles, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table/Table";
import Pagination from "@/components/shared/Pagination";
import { useGetProductsQuery } from "@/redux/service/products";
import tableColumns from "./columns";
import Filters from "./filters";

const AllProducts = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<"active" | "deleted">("active");
  const [isParams, setIsParams] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 15 });

  const columns = useMemo(() => tableColumns({ type: filter }), [filter]);

  const { data, isLoading } = useGetProductsQuery(
    `page=${pagination.page}&limit=${pagination.limit}&isDelete=${
      filter === "active" ? "false" : "true"
    }&${isParams}`
  );

  const products = data?.data || [];
  const meta = data?.meta;

  // Compute metrics from current page or totals
  const stats = useMemo(() => {
    let inStock = 0;
    let outOfStock = 0;
    let featuredCount = 0;

    products.forEach((p) => {
      const s = p.stock || 0;
      if (s > 0) inStock++;
      else outOfStock++;
      if (p.isFeatured) featuredCount++;
    });

    return { inStock, outOfStock, featuredCount };
  }, [products]);

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Products Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage your product inventory, pricing, variants, and live status
          </p>
        </div>

        <Button
          onClick={() => router.push("/admin/products/form")}
          className="h-9 px-4 text-xs font-bold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-brand-light text-brand flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Total Products
            </p>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
              {(meta?.total || products.length).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              In-Stock (On Page)
            </p>
            <p className="text-base sm:text-lg font-extrabold text-emerald-600 mt-0.5">
              {stats.inStock}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Out of Stock
            </p>
            <p className="text-base sm:text-lg font-extrabold text-red-600 mt-0.5">
              {stats.outOfStock}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Featured Items
            </p>
            <p className="text-base sm:text-lg font-extrabold text-amber-600 mt-0.5">
              {stats.featuredCount}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Filters setParams={setIsParams} />

      {/* Active vs Deleted Tabs */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => {
            setFilter("active");
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className={`h-8 px-3.5 text-xs font-semibold rounded-md gap-1.5 ${
            filter === "active"
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Active Products</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant={filter === "deleted" ? "default" : "outline"}
          onClick={() => {
            setFilter("deleted");
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className={`h-8 px-3.5 text-xs font-semibold rounded-md gap-1.5 ${
            filter === "deleted"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Trash / Deleted</span>
        </Button>
      </div>

      {/* Table Card */}
      <Card className="p-0 border border-slate-200/90 rounded-lg shadow-xs overflow-hidden bg-white">
        <CardContent className="p-0">
          <DataTable columns={columns} data={products} loading={isLoading} />
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="pt-2">
        <Pagination
          page={meta?.page || 1}
          totalPages={meta?.totalPages || 1}
          onPageChange={(page) =>
            setPagination((prev) => ({
              ...prev,
              page,
            }))
          }
        />
      </div>
    </div>
  );
};

export default AllProducts;
