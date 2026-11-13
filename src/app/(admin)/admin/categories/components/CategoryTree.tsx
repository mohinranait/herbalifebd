"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Pen,
  RotateCcw,
  Trash2,
  ExternalLink,
  Plus,
  Package,
  Layers,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ICategoryTreeNode } from "./BuildTree";
import {
  useDeleteCategoryMutation,
  useSoftDeleteCategoryMutation,
} from "@/redux/service/categories";
import DeleteAlert from "@/components/shared/DeleteAlert";
import CategoryForm from "./CategoryForm";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";

interface CategoryTreeProps {
  data: ICategoryTreeNode[];
  type: "active" | "deleted";
}

export function CategoryTree({ data, type }: CategoryTreeProps) {
  const [expandAll, setExpandAll] = useState<boolean | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
        <Folder className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2 stroke-1" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          No categories found
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Click &ldquo;Add Category&rdquo; above to create a new category
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Expand/Collapse Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-md text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Layers className="w-3.5 h-3.5 text-orange-500" />
          <span>Category Hierarchy Tree ({data.length} Root Categories)</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpandAll(true)}
            className="h-7 px-2.5 text-[11px] font-medium text-slate-600 hover:text-slate-900"
          >
            Expand All
          </Button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpandAll(false)}
            className="h-7 px-2.5 text-[11px] font-medium text-slate-600 hover:text-slate-900"
          >
            Collapse All
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden shadow-xs">
        {data.map((node) => (
          <CategoryNode
            key={node.id}
            node={node}
            depth={0}
            type={type}
            forceExpanded={expandAll}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryNode({
  node,
  depth,
  type,
  forceExpanded,
}: {
  node: ICategoryTreeNode;
  depth: number;
  type: "active" | "deleted";
  forceExpanded: boolean | null;
}) {
  const [isSelfExpanded, setIsSelfExpanded] = useState<boolean>(depth < 1);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenAddChild, setIsOpenAddChild] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const open = forceExpanded !== null ? forceExpanded : isSelfExpanded;
  const hasChildren = node.children && node.children.length > 0;

  const [softDeleteCategory, { isLoading }] = useSoftDeleteCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const softDelete = async (isDelete: boolean) => {
    try {
      await softDeleteCategory({
        id: node.id,
        payload: { isDelete },
      }).unwrap();
      toast.success(
        isDelete
          ? "Category moved to trash!"
          : "Category restored successfully!"
      );
      setIsDeleteOpen(false);
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  const hardDelete = async () => {
    try {
      await deleteCategory(node.id).unwrap();
      toast.success("Category permanently deleted!");
      setIsDeleteOpen(false);
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  const handleEditAndRestore = () => {
    if (type === "active") {
      setIsOpenEdit(true);
    } else {
      softDelete(false);
    }
  };

  const handleDelete = () => {
    if (type === "active") {
      softDelete(true);
    } else {
      hardDelete();
    }
  };

  return (
    <div className="transition-colors">
      <div
        className={cn(
          "group flex items-center justify-between gap-2.5 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all",
          depth > 0 && "bg-slate-50/40 dark:bg-slate-900/40"
        )}
        style={{ paddingLeft: `${depth * 28 + 12}px` }}
      >
        {/* Left Side */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => hasChildren && setIsSelfExpanded(!open)}
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors shrink-0",
              !hasChildren && "opacity-0 cursor-default"
            )}
            title={hasChildren ? (open ? "Collapse" : "Expand") : ""}
          >
            {hasChildren &&
              (open ? (
                <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              ))}
          </button>

          <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0">
            {node.thumbnail ? (
              <Image
                src={node.thumbnail}
                alt={node.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : hasChildren && open ? (
              <FolderOpen className="w-4 h-4 text-orange-500" />
            ) : (
              <Folder className="w-4 h-4 text-slate-400" />
            )}
          </div>

          <div className="min-w-0 flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {node.name}
            </span>

            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded truncate">
              /{node.slug}
            </span>

            {depth === 0 ? (
              <span className="hidden sm:inline-flex text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 px-1.5 py-0.5 rounded-full">
                Root
              </span>
            ) : (
              <span className="hidden sm:inline-flex text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                Subcategory (L{depth})
              </span>
            )}

            {hasChildren && (
              <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/50 px-1.5 py-0.5 rounded">
                {node.children.length} sub
              </span>
            )}
          </div>
        </div>

        {/* Center / Stats */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className="text-[11px] font-medium text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 px-2 py-0.5 gap-1 hidden xs:inline-flex"
          >
            <Package className="w-3 h-3 text-slate-400" />
            <span>{node.totalProducts ?? 0} items</span>
          </Badge>

          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
              node.status
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/60"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/70 dark:border-rose-800/60"
            )}
          >
            {node.status ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <Link
            href={`/shop?category=${node.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Preview on Storefront"
            className="w-7 h-7 rounded-md border border-slate-200/80 dark:border-slate-700 text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 flex items-center justify-center transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {type === "active" && (
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-7 w-7 rounded-md text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-slate-200/80 dark:border-slate-700"
              title="Add Subcategory"
              onClick={() => setIsOpenAddChild(true)}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          )}

          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-7 w-7 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 border-slate-200/80 dark:border-slate-700"
            title={type === "active" ? "Edit Category" : "Restore Category"}
            onClick={handleEditAndRestore}
          >
            {type === "active" ? (
              <Pen className="w-3.5 h-3.5" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            )}
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            title={type === "active" ? "Move to Trash" : "Permanently Delete"}
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Alert */}
      <DeleteAlert
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
        callBack={handleDelete}
        isLoading={isLoading}
        text={
          type === "active"
            ? `Category "${node.name}" will be moved to trash.`
            : `Category "${node.name}" will be permanently deleted. This action cannot be undone.`
        }
        deleteType={node?.name}
      />

      <CategoryForm
        isOpen={isOpenEdit}
        setIsOpen={setIsOpenEdit}
        previousData={node}
      />

      <CategoryForm
        isOpen={isOpenAddChild}
        setIsOpen={setIsOpenAddChild}
        defaultParentId={node.id}
      />

      {hasChildren && open && (
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-5 sm:ml-7">
          {node.children.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              depth={depth + 1}
              type={type}
              forceExpanded={forceExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
