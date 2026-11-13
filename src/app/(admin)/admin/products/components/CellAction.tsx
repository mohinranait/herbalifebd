"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pen, RotateCcw, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IProduct } from "@/redux/service/products/type";
import DeleteAlert from "@/components/shared/DeleteAlert";
import {
  useDeleteProductMutation,
  useSoftDeleteProductMutation,
} from "@/redux/service/products";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";

interface Props {
  data: IProduct;
  type: "active" | "deleted";
}

const CellAction: React.FC<Props> = ({ data, type }) => {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [softDeleteProduct, { isLoading }] = useSoftDeleteProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  // Soft delete / Restore
  const softDelete = async (action: "restore" | "soft" = "restore") => {
    try {
      await softDeleteProduct({
        id: data.id,
        payload: { isDelete: action === "soft" },
      }).unwrap();
      toast.success(
        action === "restore"
          ? "Product restored successfully!"
          : "Product moved to trash!"
      );
      setIsDeleteOpen(false);
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  // Permanent hard delete
  const hardDelete = async () => {
    try {
      await deleteProduct(data.id).unwrap();
      toast.success("Product permanently deleted!");
      setIsDeleteOpen(false);
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  const handleEditAndRestore = () => {
    if (type === "active") {
      router.push(`/admin/products/form?pid=${data.id}`);
    } else {
      softDelete("restore");
    }
  };

  const handleDelete = () => {
    if (type === "active") {
      softDelete("soft");
    } else {
      hardDelete();
    }
  };

  return (
    <div className="flex justify-end items-center gap-1.5">
      {/* PREVIEW ON STORE (only if active) */}
      {type === "active" && data.slug && (
        <Link href={`/product/${data.slug}`} target="_blank" title="View on storefront">
          <Button
            size="icon"
            variant="ghost"
            type="button"
            className="h-8 w-8 rounded-md text-slate-500 hover:text-primary hover:bg-primary/10"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </Link>
      )}

      {/* EDIT / RESTORE */}
      <Button
        size="icon"
        variant="outline"
        type="button"
        onClick={handleEditAndRestore}
        className="h-8 w-8 rounded-md border-slate-200 text-slate-700 hover:bg-slate-100"
        title={type === "active" ? "Edit Product" : "Restore Product"}
      >
        {type === "active" ? (
          <Pen className="w-3.5 h-3.5" />
        ) : (
          <RotateCcw className="w-3.5 h-3.5 text-primary" />
        )}
      </Button>

      {/* DELETE BUTTON */}
      <Button
        size="icon"
        variant="outline"
        onClick={() => setIsDeleteOpen(true)}
        className="h-8 w-8 rounded-md border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200"
        title={type === "active" ? "Move to Trash" : "Permanently Delete"}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>

      {/* DELETE CONFIRM MODAL */}
      <DeleteAlert
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
        callBack={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CellAction;
