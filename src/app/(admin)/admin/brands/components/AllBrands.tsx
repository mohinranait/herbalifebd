"use client";

import React, { useState, useMemo } from "react";
import { Plus, Award, CheckCircle2, AlertCircle, Trash2, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/Table";
import Pagination from "@/components/shared/Pagination";
import { useGetBrandsQuery } from "@/redux/service/brand";
import tableColumns from "./columns";
import Filters from "./filters";
import BrandForm from "./BrandForm";

const AllBrands = () => {
  const [filter, setFilter] = useState<"active" | "deleted">("active");
  const [isParams, setIsParams] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 15 });

  const columns = useMemo(() => tableColumns({ type: filter }), [filter]);

  const { data, isLoading } = useGetBrandsQuery(
    `page=${pagination.page}&limit=${pagination.limit}&isDelete=${
      filter === "active" ? "false" : "true"
    }&${isParams}`
  );

  const brands = data?.data || [];
  const meta = data?.meta;

  const stats = useMemo(() => {
    let active = 0;
    let inactive = 0;

    brands.forEach((b) => {
      if (b.status) active++;
      else inactive++;
    });

    return { active, inactive };
  }, [brands]);

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Brands Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage product manufacturer brands, logos, priority and visibility
          </p>
        </div>

        <Button
          onClick={() => setIsOpen(true)}
          className="h-9 px-4 text-xs font-bold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Brand</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-brand-light text-brand flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Total Brands
            </p>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
              {(meta?.total || brands.length).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Active Brands
            </p>
            <p className="text-base sm:text-lg font-extrabold text-emerald-600 mt-0.5">
              {stats.active}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Draft / Inactive
            </p>
            <p className="text-base sm:text-lg font-extrabold text-slate-700 mt-0.5">
              {stats.inactive}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Filters setParams={setIsParams} />

      {/* Tabs */}
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
          <Award className="w-3.5 h-3.5" />
          <span>Active Brands</span>
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
          <DataTable columns={columns} data={brands} loading={isLoading} />
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

      {/* Modal for adding brand */}
      <BrandForm isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

export default AllBrands;
