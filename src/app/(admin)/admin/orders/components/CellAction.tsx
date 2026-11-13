"use client";

import { Button } from '@/components/ui/button';
import { Eye, FileText, Loader2, Pen, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import DeleteAlert from '@/components/shared/DeleteAlert';
import { useRouter } from 'next/navigation';
import { IOrder } from '@/redux/service/orders/type';
import Link from 'next/link';
import { useDeleteOrderMutation } from '@/redux/service/orders';
import handleErrors, { ErrorResponse } from '@/lib/handle-error';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formateDownloadInvoice } from '@/app/(root)/dashboard/orders/[orderId]/components/download-invoice';

type Props = {
  data: IOrder;
};

const CellAction = ({ data }: Props) => {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deleteOrder, { isLoading: deleteLoading }] = useDeleteOrderMutation();

  const handleEditAndRestore = () => {
    router.push(`/admin/order/${data?.id}?mode=edit`);
  };

  const handleDownloadInvoice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data) return;
    setIsDownloading(true);
    try {
      await formateDownloadInvoice(data);
      toast.success(`Invoice for #${data.invoiceNumber} downloaded!`);
    } catch (error) {
      console.error("Invoice generation failed:", error);
      toast.error("Failed to generate PDF invoice.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrder(data?.id).unwrap();
      toast.success("Order deleted successfully");
      setIsDeleteOpen(false);
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
        {/* VIEW DETAILS */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/admin/order/${data?.id}`}>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md"
              >
                <Eye className="w-4 h-4" />
                <span className="sr-only">View Order</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>View Order Details</p>
          </TooltipContent>
        </Tooltip>

        {/* DOWNLOAD INVOICE */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md"
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span className="sr-only">Download Invoice</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Download Invoice PDF</p>
          </TooltipContent>
        </Tooltip>

        {/* EDIT ORDER */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              type="button"
              className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md"
              onClick={handleEditAndRestore}
            >
              <Pen className="w-4 h-4" />
              <span className="sr-only">Edit Order</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Edit Order</p>
          </TooltipContent>
        </Tooltip>

        {/* DELETE ORDER */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only">Delete Order</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Delete Order</p>
          </TooltipContent>
        </Tooltip>

        {/* DELETE CONFIRM MODAL */}
        <DeleteAlert
          isDeleteOpen={isDeleteOpen}
          setIsDeleteOpen={setIsDeleteOpen}
          callBack={handleDelete}
          isLoading={deleteLoading}
          text="This order will be moved to trash. You cannot restore it later."
          deleteType={`#${data?.invoiceNumber}`}
        />
      </div>
    </TooltipProvider>
  );
};

export default CellAction;
