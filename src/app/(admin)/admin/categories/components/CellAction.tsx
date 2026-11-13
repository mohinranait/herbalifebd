"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pen, RotateCcw, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ICategory } from "@/redux/service/categories/type";
import CategoryForm from "./CategoryForm";
import {
  useDeleteCategoryMutation,
  useSoftDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/redux/service/categories";
import DeleteAlert from "@/components/shared/DeleteAlert";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";

type Props = {
  data: ICategory;
  type: "active" | "deleted";
};

const CellAction = ({ data, type }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [softDeleteCategory, { isLoading: isSoftDeleting }] = useSoftDeleteCategoryMutation();
  const [deleteCategory, { isLoading: isHardDeleting }] = useDeleteCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const handleStatusToggle = async (checked: boolean) => {
    try {
      await updateCategory({
        id: data.id,
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
      await softDeleteCategory({ id: data.id, payload: { isDelete } }).unwrap();
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
      await deleteCategory(data?.id).unwrap();
      toast.success("Category permanently deleted!");
      setIsDeleteOpen(false);
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  const handleEditAndRestore = () => {
    if (type === "active") {
      setIsOpen(true);
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
    <div className="flex items-center justify-end gap-1.5">
      {/* Quick Status toggle (only in active tab) */}
      {type === "active" && (
        <div className="mr-1">
          <Switch
            checked={data.status}
            onCheckedChange={handleStatusToggle}
            disabled={isUpdating}
            title={data.status ? "Click to deactivate" : "Click to activate"}
          />
        </div>
      )}

      {/* Preview Link */}
      <Link
        href={`/shop?category=${data.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        title="View on Storefront"
        className="w-7 h-7 rounded-md border border-slate-200/80 dark:border-slate-700 text-slate-500 hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>

      {/* Edit / Restore */}
      <Button
        size="icon"
        variant="outline"
        type="button"
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

      {/* Delete / Permanent Delete */}
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
        title={type === "active" ? "Move to Trash" : "Permanently Delete"}
        onClick={() => setIsDeleteOpen(true)}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>

      {/* Delete Confirm Modal */}
      <DeleteAlert
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
        callBack={handleDelete}
        isLoading={isSoftDeleting || isHardDeleting}
        text={
          type === "active"
            ? `Category "${data.name}" will be moved to trash.`
            : `Category "${data.name}" will be permanently deleted. This action cannot be undone.`
        }
        deleteType={data?.name}
      />

      {/* Edit Modal */}
      <CategoryForm
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        previousData={data}
      />
    </div>
  );
};

export default CellAction;
