"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Folder,
  FolderOpen,
  Plus,
  Pen,
  RotateCcw,
  Trash2,
  ExternalLink,
  Package,
  Layers,
  ChevronDown,
  ChevronRight,
  GitFork,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ICategoryTreeNode } from "./BuildTree";
import {
  useDeleteCategoryMutation,
  useSoftDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/redux/service/categories";
import DeleteAlert from "@/components/shared/DeleteAlert";
import CategoryForm from "./CategoryForm";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";

interface CategoryCardTreeProps {
  data: ICategoryTreeNode[];
  type: "active" | "deleted";
}

export default function CategoryCardTree({ data, type }: CategoryCardTreeProps) {
  const [expandAll, setExpandAll] = useState<boolean | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/60 flex items-center justify-center text-orange-500 mb-3">
          <Folder className="w-7 h-7 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          No categories found
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          No categories have been created yet or none match your filters. Click &ldquo;Add New Category&rdquo; above to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-xs text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
          <Layers className="w-4 h-4 text-orange-500" />
          <span>
            Nested Category Card Hierarchy —{" "}
            <strong className="text-slate-900 dark:text-slate-100 font-bold">
              {data.length}
            </strong>{" "}
            Root Categories
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpandAll(true)}
            className="h-7 px-2.5 text-xs font-semibold text-slate-600 hover:text-orange-600"
          >
            Expand All Cards
          </Button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpandAll(false)}
            className="h-7 px-2.5 text-xs font-semibold text-slate-600 hover:text-orange-600"
          >
            Collapse All Cards
          </Button>
        </div>
      </div>

      {/* List of Parent (Root) Cards */}
      <div className="space-y-4">
        {data.map((rootNode) => (
          <ParentCategoryCard
            key={rootNode.id}
            node={rootNode}
            type={type}
            forceExpanded={expandAll}
          />
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 1. PARENT / ROOT CARD (Master Container)
// ----------------------------------------------------
function ParentCategoryCard({
  node,
  type,
  forceExpanded,
}: {
  node: ICategoryTreeNode;
  type: "active" | "deleted";
  forceExpanded: boolean | null;
}) {
  const [isSelfExpanded, setIsSelfExpanded] = useState(true);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenAddChild, setIsOpenAddChild] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isExpanded = forceExpanded !== null ? forceExpanded : isSelfExpanded;
  const hasChildren = node.children && node.children.length > 0;
  const childrenCount = node.children ? node.children.length : 0;

  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [softDeleteCategory, { isLoading: isSoftDeleting }] = useSoftDeleteCategoryMutation();
  const [deleteCategory, { isLoading: isHardDeleting }] = useDeleteCategoryMutation();

  const handleStatusToggle = async (checked: boolean) => {
    try {
      await updateCategory({
        id: node.id,
        payload: { status: checked },
      }).unwrap();
      toast.success(checked ? "Category activated successfully!" : "Category deactivated successfully!");
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  const softDelete = async (isDelete: boolean) => {
    try {
      await softDeleteCategory({ id: node.id, payload: { isDelete } }).unwrap();
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700">
      {/* 1.1 Root Card Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50/80 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Thumbnail & Main Info */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          {/* Thumbnail */}
          <div className="relative w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200/70 dark:border-orange-800/60 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
            {node.thumbnail ? (
              <Image
                src={node.thumbnail}
                alt={node.name}
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <Folder className="w-6 h-6 text-orange-500" />
            )}
          </div>

          {/* Title, Slug & Badges */}
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {node.name}
              </h2>

              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                /{node.slug}
              </span>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200/70 dark:border-orange-800/60">
                Root Category
              </span>

              {node.priority !== undefined && node.priority > 0 && (
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  Priority: #{node.priority}
                </span>
              )}
            </div>

            {/* Sub-meta details */}
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <Package className="w-3.5 h-3.5 text-orange-500" />
                {node.totalProducts ?? 0} Products
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                <GitFork className="w-3.5 h-3.5 text-blue-500" />
                {childrenCount} Subcategories
              </span>
              {node.description && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline text-slate-400 truncate max-w-xs">
                    {node.description}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions & Expand Button */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
          {/* Status switch (active view) */}
          {type === "active" && (
            <div className="flex items-center gap-1.5 bg-slate-100/70 dark:bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60 mr-1">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {node.status ? "Active" : "Inactive"}
              </span>
              <Switch
                checked={node.status}
                onCheckedChange={handleStatusToggle}
                disabled={isUpdating}
                className="scale-75"
              />
            </div>
          )}

          {/* Quick Add Subcategory Button */}
          {type === "active" && (
            <Button
              type="button"
              size="sm"
              onClick={() => setIsOpenAddChild(true)}
              className="h-8 px-3 text-xs font-semibold rounded-md bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/80 gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Subcategory
            </Button>
          )}

          {/* Store preview */}
          <Link
            href={`/shop?category=${node.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="View on Storefront"
            className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 flex items-center justify-center transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Edit / Restore */}
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 border-slate-200 dark:border-slate-700 shadow-2xs"
            title={type === "active" ? "Edit Category" : "Restore Category"}
            onClick={handleEditAndRestore}
          >
            {type === "active" ? (
              <Pen className="w-3.5 h-3.5" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            )}
          </Button>

          {/* Delete / Permanent Delete */}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            title={type === "active" ? "Move to Trash" : "Permanently Delete"}
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>

          {/* Accordion Expand/Collapse Button */}
          {hasChildren && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSelfExpanded(!isExpanded)}
              className="h-8 px-2.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1 ml-1"
            >
              <span>{isExpanded ? "Collapse" : `View Subcards (${childrenCount})`}</span>
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* 1.2 Nested Children Container (Children Cards Grid) */}
      {isExpanded && (
        <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80">
          {hasChildren ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-0.5">
                <span className="flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5 text-orange-500" />
                  Subcategories of &ldquo;{node.name}&rdquo; ({childrenCount})
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Level 2 & Level 3 Nested Cards
                </span>
              </div>

              {/* Children Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {node.children.map((childNode) => (
                  <ChildCategoryCard
                    key={childNode.id}
                    node={childNode}
                    parentName={node.name}
                    type={type}
                  />
                ))}

                {/* Inline Add Subcategory Dashed Card */}
                {type === "active" && (
                  <button
                    type="button"
                    onClick={() => setIsOpenAddChild(true)}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-500 rounded-lg p-5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all bg-white/50 dark:bg-slate-900/40 hover:bg-orange-50/40 dark:hover:bg-orange-950/20 group min-h-[140px]"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4 text-slate-500 group-hover:text-orange-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-orange-600">
                      Add New Subcategory
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Parent: {node.name}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Empty Children Prompt */
            <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-2">
              <FolderPlus className="w-8 h-8 text-slate-300 dark:text-slate-700 stroke-1" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                No subcategories added to this category yet
              </p>
              {type === "active" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsOpenAddChild(true)}
                  className="h-7 text-xs font-semibold text-orange-600 hover:bg-orange-50 rounded-md border-orange-200 gap-1.5 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add First Subcategory
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Alert */}
      <DeleteAlert
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
        callBack={handleDelete}
        isLoading={isSoftDeleting || isHardDeleting}
        text={
          type === "active"
            ? `Category "${node.name}" and all its child branches will be moved to trash.`
            : `Category "${node.name}" will be permanently deleted. This action cannot be undone.`
        }
        deleteType={node?.name}
      />

      {/* Edit Modal */}
      <CategoryForm
        isOpen={isOpenEdit}
        setIsOpen={setIsOpenEdit}
        previousData={node}
      />

      {/* Add Subcategory Modal */}
      <CategoryForm
        isOpen={isOpenAddChild}
        setIsOpen={setIsOpenAddChild}
        defaultParentId={node.id}
      />
    </div>
  );
}

// ----------------------------------------------------
// 2. CHILD CATEGORY CARD (Inside Parent Card)
// ----------------------------------------------------
function ChildCategoryCard({
  node,
  parentName,
  type,
}: {
  node: ICategoryTreeNode;
  parentName: string;
  type: "active" | "deleted";
}) {
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenAddGrandChild, setIsOpenAddGrandChild] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const grandChildren = node.children || [];
  const hasGrandChildren = grandChildren.length > 0;

  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [softDeleteCategory, { isLoading: isSoftDeleting }] = useSoftDeleteCategoryMutation();
  const [deleteCategory, { isLoading: isHardDeleting }] = useDeleteCategoryMutation();

  const handleStatusToggle = async (checked: boolean) => {
    try {
      await updateCategory({
        id: node.id,
        payload: { status: checked },
      }).unwrap();
      toast.success(checked ? "Subcategory activated!" : "Subcategory deactivated!");
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  const softDelete = async (isDelete: boolean) => {
    try {
      await softDeleteCategory({ id: node.id, payload: { isDelete } }).unwrap();
      toast.success(
        isDelete
          ? "Subcategory moved to trash!"
          : "Subcategory restored successfully!"
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
      toast.success("Subcategory permanently deleted!");
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
      {/* Top Header: Icon + Name + Actions */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          {/* Thumbnail & Title */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0">
              {node.thumbnail ? (
                <Image
                  src={node.thumbnail}
                  alt={node.name}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FolderOpen className="w-4 h-4 text-slate-500" />
              )}
            </div>

            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {node.name}
              </h4>
              <p className="text-[10px] font-mono text-slate-400 truncate">
                /{node.slug}
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href={`/shop?category=${node.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              title="View on Storefront"
              className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-orange-600 hover:bg-orange-50 flex items-center justify-center transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </Link>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded text-slate-500 hover:text-blue-600"
              title="Edit Subcategory"
              onClick={handleEditAndRestore}
            >
              {type === "active" ? (
                <Pen className="w-3 h-3" />
              ) : (
                <RotateCcw className="w-3 h-3 text-blue-600" />
              )}
            </Button>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded text-slate-400 hover:text-rose-600"
              title="Delete"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Status & Product Count Badges */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <Package className="w-3 h-3 text-slate-400" />
            {node.totalProducts ?? 0} Products
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded-full border",
                node.status
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/70"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/70"
              )}
            >
              {node.status ? "Active" : "Inactive"}
            </span>

            {type === "active" && (
              <Switch
                checked={node.status}
                onCheckedChange={handleStatusToggle}
                disabled={isUpdating}
                className="scale-65 origin-right"
              />
            )}
          </div>
        </div>
      </div>

      {/* 2.1 GRANDCHILDREN SECTION */}
      {hasGrandChildren && (
        <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Sub-branches (Level 3 - {grandChildren.length})</span>
            {type === "active" && (
              <button
                type="button"
                onClick={() => setIsOpenAddGrandChild(true)}
                className="text-orange-600 hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-2.5 h-2.5" /> Add
              </button>
            )}
          </div>

          {/* Grandchildren Mini Cards */}
          <div className="space-y-1">
            {grandChildren.map((grandChild) => (
              <GrandChildItem
                key={grandChild.id}
                node={grandChild}
                type={type}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Level 3 Child Button if none exists */}
      {!hasGrandChildren && type === "active" && (
        <div className="pt-2 border-t border-dashed border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsOpenAddGrandChild(true)}
            className="w-full py-1 text-[11px] font-medium text-slate-500 hover:text-orange-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Level 3 Sub-branch
          </button>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      <DeleteAlert
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
        callBack={handleDelete}
        isLoading={isSoftDeleting || isHardDeleting}
        text={
          type === "active"
            ? `Subcategory "${node.name}" will be moved to trash.`
            : `Subcategory "${node.name}" will be permanently deleted.`
        }
        deleteType={node?.name}
      />

      {/* Edit Modal */}
      <CategoryForm
        isOpen={isOpenEdit}
        setIsOpen={setIsOpenEdit}
        previousData={node}
      />

      {/* Add Level 3 GrandChild Modal */}
      <CategoryForm
        isOpen={isOpenAddGrandChild}
        setIsOpen={setIsOpenAddGrandChild}
        defaultParentId={node.id}
      />
    </div>
  );
}

// ----------------------------------------------------
// 3. GRANDCHILD CARD ITEM (Level 3 inside Child Card)
// ----------------------------------------------------
function GrandChildItem({
  node,
  type,
}: {
  node: ICategoryTreeNode;
  type: "active" | "deleted";
}) {
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [softDeleteCategory, { isLoading: isSoftDeleting }] = useSoftDeleteCategoryMutation();
  const [deleteCategory, { isLoading: isHardDeleting }] = useDeleteCategoryMutation();

  const softDelete = async (isDelete: boolean) => {
    try {
      await softDeleteCategory({ id: node.id, payload: { isDelete } }).unwrap();
      toast.success(isDelete ? "Item moved to trash!" : "Item restored successfully!");
      setIsDeleteOpen(false);
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  const hardDelete = async () => {
    try {
      await deleteCategory(node.id).unwrap();
      toast.success("Item permanently deleted!");
      setIsDeleteOpen(false);
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  return (
    <div className="flex items-center justify-between p-1.5 px-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded text-xs group hover:bg-white dark:hover:bg-slate-800 transition-colors">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
        <span className="font-medium text-slate-800 dark:text-slate-200 truncate text-[11px]">
          {node.name}
        </span>
        <span className="text-[10px] text-slate-400">
          ({node.totalProducts ?? 0})
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
        <Link
          href={`/shop?category=${node.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-orange-500"
          title="View on Storefront"
        >
          <ExternalLink className="w-3 h-3" />
        </Link>
        <button
          type="button"
          onClick={() => (type === "active" ? setIsOpenEdit(true) : softDelete(false))}
          className="text-slate-400 hover:text-blue-600"
          title="Edit"
        >
          {type === "active" ? <Pen className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
        </button>
        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          className="text-slate-400 hover:text-rose-600"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <DeleteAlert
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
        callBack={() => (type === "active" ? softDelete(true) : hardDelete())}
        isLoading={isSoftDeleting || isHardDeleting}
        text={`Are you sure you want to delete category "${node.name}"?`}
        deleteType={node?.name}
      />

      <CategoryForm
        isOpen={isOpenEdit}
        setIsOpen={setIsOpenEdit}
        previousData={node}
      />
    </div>
  );
}
