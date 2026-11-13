"use client";

import React, { useMemo, useState } from "react";
import {
  Plus,
  FolderTree,
  Layers,
  GitFork,
  CheckCircle2,
  Table as TableIcon,
  LayoutGrid,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table/Table";
import { useGetCategoriesQuery } from "@/redux/service/categories";
import CategoryForm from "./CategoryForm";
import Filters from "./Filters";
import { buildCategoryTree } from "./BuildTree";
import CategoryCardTree from "./CategoryCardTree";
import tableColumns from "./columns";

const AllCategories = () => {
  const [filter, setFilter] = useState<"active" | "deleted">("active");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isOpen, setIsOpen] = useState(false);
  const [isParams, setIsParams] = useState("");

  const { data, isLoading } = useGetCategoriesQuery(
    `page=1&limit=2000&isDelete=${filter === "active" ? "false" : "true"}&${isParams}`
  );

  const categories = data?.data ?? [];

  // Build tree hierarchy
  const tree = useMemo(() => {
    return buildCategoryTree(categories);
  }, [categories]);

  // Categories map for table view
  const categoriesMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => {
      map.set(c.id, c.name);
    });
    return map;
  }, [categories]);

  // Columns for table view
  const columns = useMemo(
    () => tableColumns({ type: filter, categoriesMap }),
    [filter, categoriesMap]
  );

  // Compute metrics stats
  const stats = useMemo(() => {
    let rootCount = 0;
    let subCount = 0;
    let activeCount = 0;
    let inactiveCount = 0;

    categories.forEach((cat) => {
      if (!cat.parentId) rootCount++;
      else subCount++;

      if (cat.status) activeCount++;
      else inactiveCount++;
    });

    return {
      total: categories.length,
      rootCount,
      subCount,
      activeCount,
      inactiveCount,
    };
  }, [categories]);

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Categories Management
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {stats.total} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize catalog taxonomy with parent categories and nested sub-branches
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-9 px-4 text-xs font-bold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Category
          </Button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Categories */}
        <Card className="rounded-lg border-slate-200/90 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 p-3.5 sm:p-4">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Categories
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                {stats.total}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">All registered items</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <FolderTree className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Root Categories */}
        <Card className="rounded-lg border-slate-200/90 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 p-3.5 sm:p-4">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Root Cards
              </p>
              <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                {stats.rootCount}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Top-level categories</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Subcategories */}
        <Card className="rounded-lg border-slate-200/90 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 p-3.5 sm:p-4">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Nested Children
              </p>
              <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
                {stats.subCount}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Sub and branch cards</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <GitFork className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Active Categories */}
        <Card className="rounded-lg border-slate-200/90 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 p-3.5 sm:p-4">
          <CardContent className="p-0 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Categories
              </p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.activeCount}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {stats.total > 0
                  ? `${Math.round((stats.activeCount / stats.total) * 100)}% visible on store`
                  : "All active"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Filters setParams={setIsParams} />

      {/* Tabs & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Active / Deleted Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-md">
          <Button
            variant={filter === "active" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("active")}
            className={`h-7 px-3 text-xs font-semibold rounded ${
              filter === "active"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Active Categories ({stats.activeCount})
          </Button>

          <Button
            variant={filter === "deleted" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("deleted")}
            className={`h-7 px-3 text-xs font-semibold rounded gap-1.5 ${
              filter === "deleted"
                ? "bg-rose-500 text-white shadow-2xs"
                : "text-slate-500 hover:text-rose-600"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Trash / Deleted
          </Button>
        </div>

        {/* View Mode Toggle: Nested Cards vs Table */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-md ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("cards")}
            className={`h-7 px-2.5 text-xs font-semibold rounded gap-1.5 ${
              viewMode === "cards"
                ? "bg-white dark:bg-slate-800 text-primary shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
            title="Nested Cards View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Card View
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("table")}
            className={`h-7 px-2.5 text-xs font-semibold rounded gap-1.5 ${
              viewMode === "table"
                ? "bg-white dark:bg-slate-800 text-primary shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
            title="Table View"
          >
            <TableIcon className="w-3.5 h-3.5" />
            Table View
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <Card className="rounded-lg border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <Skeleton className="h-24 rounded-md" />
                  <Skeleton className="h-24 rounded-md" />
                  <Skeleton className="h-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : viewMode === "cards" ? (
        <CategoryCardTree type={filter} data={tree} />
      ) : (
        <div className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <DataTable columns={columns} data={categories} />
        </div>
      )}

      {/* Category Create/Edit Modal */}
      <CategoryForm isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

export default AllCategories;
