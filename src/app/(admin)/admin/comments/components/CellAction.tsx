"use client";

import React, { useState } from "react";
import { Pen, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IComment } from "@/redux/service/comments/type";
import CommentForm from "./CommentForm";
import DeleteAlert from "@/components/shared/DeleteAlert";
import {
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from "@/redux/service/comments";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";

interface Props {
  data: IComment;
}

const CellAction: React.FC<Props> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [deleteComment, { isLoading: deleteLoading }] = useDeleteCommentMutation();
  const [updateComment, { isLoading: updateLoading }] = useUpdateCommentMutation();

  const handleToggleApproval = async () => {
    try {
      await updateComment({
        id: data.id,
        payload: {
          isApproved: !data.isApproved,
        },
      }).unwrap();

      toast.success(
        data.isApproved
          ? "Review set to pending!"
          : "Review approved successfully!"
      );
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(data.id).unwrap();
      toast.success("Review deleted successfully!");
      setIsDeleteOpen(false);
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  return (
    <div className="flex justify-end items-center gap-1.5">
      {/* QUICK APPROVE / UNAPPROVE TOGGLE */}
      <Button
        size="icon"
        variant="ghost"
        type="button"
        disabled={updateLoading}
        onClick={handleToggleApproval}
        className={`h-8 w-8 rounded-md ${
          data.isApproved
            ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
        }`}
        title={data.isApproved ? "Unapprove Review" : "Approve Review"}
      >
        {data.isApproved ? (
          <CheckCircle2 className="w-4 h-4 fill-emerald-100" />
        ) : (
          <XCircle className="w-4 h-4" />
        )}
      </Button>

      {/* EDIT */}
      <Button
        size="icon"
        variant="outline"
        type="button"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 rounded-md border-slate-200 text-slate-700 hover:bg-slate-100"
        title="Edit Review"
      >
        <Pen className="w-3.5 h-3.5" />
      </Button>

      {/* DELETE BUTTON */}
      <Button
        size="icon"
        variant="outline"
        onClick={() => setIsDeleteOpen(true)}
        className="h-8 w-8 rounded-md border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200"
        title="Delete Review"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>

      {/* EDIT MODAL */}
      <CommentForm isOpen={isOpen} setIsOpen={setIsOpen} previousData={data} />

      {/* DELETE ALERT */}
      <DeleteAlert
        isDeleteOpen={isDeleteOpen}
        setIsDeleteOpen={setIsDeleteOpen}
        callBack={handleDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default CellAction;
