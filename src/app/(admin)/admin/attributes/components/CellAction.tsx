"use client";

import React, { useState } from "react";
import { Pen, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IAttribute } from "@/redux/service/attributes/type";
import AttributeForm from "./AttributeForm";
import DeleteAlert from "@/components/shared/DeleteAlert";
import {
  useDeleteAttributeMutation,
  useSoftDeleteAttributeMutation,
} from "@/redux/service/attributes";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";

interface Props {
  data: IAttribute;
  type: "active" | "deleted";
}

const CellAction: React.FC<Props> = ({ data, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [softDeleteAttribute, { isLoading }] = useSoftDeleteAttributeMutation();
  const [deleteAttribute] = useDeleteAttributeMutation();

  // Soft delete / Restore
  const softDelete = async (action: "restore" | "soft" = "restore") => {
    try {
      await softDeleteAttribute({
        id: data.id,
        payload: { isDelete: action === "soft" },
      }).unwrap();
      toast.success(
        action === "restore" ? "Attribute restored successfully!" : "Attribute moved to trash!"
      );
      setIsDeleteOpen(false);
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  const hardDelete = async () => {
    try {
      await deleteAttribute(data.id).unwrap();
      toast.success("Attribute permanently deleted!");
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
        title={type === "active" ? "Edit Attribute" : "Restore Attribute"}
      >
        {type === "active" ? (
          <Pen className="w-3.5 h-3.5" />
        ) : (
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
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
      <AttributeForm isOpen={isOpen} setIsOpen={setIsOpen} previousData={data} />

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
