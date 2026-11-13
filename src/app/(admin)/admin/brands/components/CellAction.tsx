"use client";

import React, { useState } from "react";
import { Pen, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IBrand } from "@/redux/service/brand/type";
import BrandForm from "./BrandForm";
import DeleteAlert from "@/components/shared/DeleteAlert";
import {
  useDeleteBrandMutation,
  useSoftDeleteBrandMutation,
} from "@/redux/service/brand";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";

interface Props {
  data: IBrand;
  type: "active" | "deleted";
}

const CellAction: React.FC<Props> = ({ data, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [softDeleteBrand, { isLoading }] = useSoftDeleteBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  // Soft delete / Restore
  const softDelete = async (action: "restore" | "soft" = "restore") => {
    try {
      await softDeleteBrand({
        id: data.id,
        payload: { isDelete: action === "soft" },
      }).unwrap();
      toast.success(
        action === "restore" ? "Brand restored successfully!" : "Brand moved to trash!"
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
      await deleteBrand(data.id).unwrap();
      toast.success("Brand permanently deleted!");
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
      {/* EDIT / RESTORE */}
      <Button
        size="icon"
        variant="outline"
        type="button"
        onClick={handleEditAndRestore}
        className="h-8 w-8 rounded-md border-slate-200 text-slate-700 hover:bg-slate-100"
        title={type === "active" ? "Edit Brand" : "Restore Brand"}
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

      {/* EDIT MODAL */}
      <BrandForm isOpen={isOpen} setIsOpen={setIsOpen} previousData={data} />

      {/* DELETE ALERT */}
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
