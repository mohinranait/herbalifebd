"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Copy,
  Check,
  MapPin,
  Phone,
  User,
  Package,
  Truck,
  MessageSquare,
  Sparkles,
  Loader2,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { IOrder, TOrderStatus } from "@/redux/service/orders/type";
import { useUpdateOrderByIdAdminMutation } from "@/redux/service/orders";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/render-status";
import { CURRENCY } from "@/lib/envSecret";
import WhatsAppIcon from "@/components/svg/WhatsApp";
import { formatWhatsappNumber } from "@/components/shared/WhatsAppButton";
import handleErrors, { ErrorResponse } from "@/lib/handle-error";
import CellAction from "./CellAction";

/* -------------------------------------------------------------------------- */
/*                               INVOICE CELL                                 */
/* -------------------------------------------------------------------------- */
const InvoiceCell = ({ order }: { order: IOrder }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(order.invoiceNumber);
    setCopied(true);
    toast.success("Invoice number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = order?.createdAt
    ? format(new Date(order.createdAt), "dd MMM yyyy")
    : "--";
  const formattedTime = order?.createdAt
    ? format(new Date(order.createdAt), "hh:mm a")
    : "";

  return (
    <div className="flex flex-col gap-1.5 py-1">
      {/* Invoice Badge + Copy */}
      <div className="flex items-center gap-1.5">
        <Link
          href={`/admin/order/${order?.id}`}
          className="font-mono text-xs font-semibold text-primary hover:underline"
        >
          #{order.invoiceNumber}
        </Link>
        <button
          type="button"
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
          title="Copy invoice number"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Date & Time */}
      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
        <span>{formattedDate}</span>
        <span>•</span>
        <span>{formattedTime}</span>
      </div>

      {/* Courier / Tracking */}
      {(order?.courierName || order?.trackingNumber) && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
          <Truck className="w-3 h-3 text-primary/70 shrink-0" />
          <span className="truncate max-w-[130px]" title={order.trackingNumber || ""}>
            {order.courierName ? `${order.courierName}: ` : ""}
            {order.trackingNumber || "--"}
          </span>
        </div>
      )}

      {/* Customer Note */}
      {order?.customerNote && (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded px-1.5 py-0.5 w-fit cursor-help">
                <MessageSquare className="w-2.5 h-2.5" />
                <span>Note</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="font-semibold text-xs mb-0.5">Customer Note:</p>
              <p className="text-xs">{order.customerNote}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               CUSTOMER CELL                                */
/* -------------------------------------------------------------------------- */
const CustomerCell = ({ order }: { order: IOrder }) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const shipping = order?.shippingAddress;
  const phone = shipping?.phone || order?.user?.phone || "";
  const name = shipping?.fullName || order?.user?.name || "Anonymous";
  const whatsappNumber = formatWhatsappNumber(phone);

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    toast.success("Phone number copied!");
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1 py-1 max-w-[200px]">
      {/* Name */}
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-xs text-foreground truncate" title={name}>
          {name}
        </span>
        {order.userId && (
          <span
            className="text-[10px] px-1 py-0.2 bg-primary/10 text-primary font-medium rounded"
            title="Registered customer"
          >
            User
          </span>
        )}
      </div>

      {/* Phone with WhatsApp & Call */}
      {phone && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Phone className="w-3 h-3 text-muted-foreground/70 shrink-0" />
          <a
            href={`tel:${phone}`}
            className="font-mono text-[11px] hover:text-primary transition-colors"
            title="Call customer"
          >
            {phone}
          </a>
          <button
            type="button"
            onClick={handleCopyPhone}
            className="p-0.5 hover:text-foreground text-muted-foreground"
            title="Copy phone"
          >
            {copiedPhone ? (
              <Check className="w-2.5 h-2.5 text-emerald-500" />
            ) : (
              <Copy className="w-2.5 h-2.5" />
            )}
          </button>
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 p-0.5 transition-colors"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
            </a>
          )}
        </div>
      )}

      {/* Address */}
      {shipping?.address && (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-start gap-1 text-[11px] text-muted-foreground cursor-default">
                <MapPin className="w-3 h-3 shrink-0 text-muted-foreground/70 mt-0.5" />
                <span className="truncate">
                  {shipping.address}
                  {shipping.postalCode ? `, ${shipping.postalCode}` : ""}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-semibold text-xs mb-0.5">Shipping Address:</p>
              <p className="text-xs">
                {shipping.address}
                {shipping.postalCode ? `, Post: ${shipping.postalCode}` : ""}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                ITEMS CELL                                  */
/* -------------------------------------------------------------------------- */
const ItemsCell = ({ order }: { order: IOrder }) => {
  const items = order?.items || [];
  const firstItem = items[0];
  const moreCount = items.length - 1;

  return (
    <div className="flex items-center gap-2.5 py-1 min-w-[180px] max-w-[230px]">
      {/* Product Thumbnails Stack */}
      <div className="flex -space-x-3 shrink-0 overflow-hidden py-1">
        {items.slice(0, 3).map((item, idx) => (
          <div
            key={item.id || idx}
            className="relative w-8 h-8 rounded-md border-2 border-background bg-muted overflow-hidden shadow-xs shrink-0"
            title={`${item.productName} (x${item.quantity})`}
          >
            {item.productImage ? (
              <Image
                src={item.productImage}
                alt={item.productName || "Product"}
                fill
                sizes="32px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-[10px] text-muted-foreground">
                <Package className="w-4 h-4 text-muted-foreground/60" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Item info */}
      <div className="flex flex-col min-w-0">
        <p
          className="text-xs font-medium text-foreground truncate"
          title={firstItem?.productName || "Items"}
        >
          {firstItem?.productName || "No items"}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
          <span className="font-semibold text-foreground/80">
            {order.totalQuantity || items.reduce((s, i) => s + (i.quantity || 1), 0)} pcs
          </span>
          <span>•</span>
          <span>
            {order.totalItems || items.length} {items.length > 1 ? "items" : "item"}
          </span>
          {moreCount > 0 && (
            <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded text-muted-foreground font-medium">
              +{moreCount} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               PAYMENT CELL                                 */
/* -------------------------------------------------------------------------- */
const PaymentCell = ({ order }: { order: IOrder }) => {
  const [copiedTrx, setCopiedTrx] = useState(false);
  const payment = order?.payment;
  const method = payment?.method || "COD";
  const trxId = payment?.transactionId;

  const handleCopyTrx = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!trxId) return;
    navigator.clipboard.writeText(trxId);
    setCopiedTrx(true);
    toast.success("Transaction ID copied!");
    setTimeout(() => setCopiedTrx(false), 2000);
  };

  const getMethodBadge = (m: string) => {
    switch (m) {
      case "BKASH":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
            bKash
          </span>
        );
      case "NAGAD":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            Nagad
          </span>
        );
      case "COD":
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            COD
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-1 py-1">
      <div className="flex items-center gap-1.5">
        {getMethodBadge(method)}
        <PaymentStatusBadge status={payment?.status || "PENDING"} />
      </div>

      {trxId && (
        <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground mt-0.5">
          <span className="truncate max-w-[110px]" title={trxId}>
            Trx: {trxId}
          </span>
          <button
            type="button"
            onClick={handleCopyTrx}
            className="hover:text-foreground text-muted-foreground p-0.5"
            title="Copy Transaction ID"
          >
            {copiedTrx ? (
              <Check className="w-2.5 h-2.5 text-emerald-500" />
            ) : (
              <Copy className="w-2.5 h-2.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                PRICING CELL                                */
/* -------------------------------------------------------------------------- */
const PricingCell = ({ order }: { order: IOrder }) => {
  const pricing = order?.pricing;
  const total = Number(pricing?.total) || 0;
  const subtotal = Number(pricing?.subtotal) || 0;
  const shippingCharge = Number(pricing?.shippingCharge) || 0;
  const discount = Number(pricing?.discount) || 0;

  return (
    <div className="flex flex-col gap-0.5 py-1">
      {/* Total Amount */}
      <span className="text-sm font-bold text-foreground">
        {CURRENCY} {total.toLocaleString()}
      </span>

      {/* Breakdown */}
      <div className="text-[11px] text-muted-foreground flex flex-col">
        <span>Items: {CURRENCY} {subtotal.toLocaleString()}</span>
        <span>Ship: {CURRENCY} {shippingCharge.toLocaleString()}</span>
      </div>

      {/* Discount Badge */}
      {discount > 0 && (
        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-1 py-0.2 rounded w-fit mt-0.5">
          Saved {CURRENCY} {discount.toLocaleString()}
        </span>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                          ORDER STATUS CELL (INLINE)                        */
/* -------------------------------------------------------------------------- */
const STATUS_OPTIONS: { label: string; value: TOrderStatus; color: string }[] = [
  { label: "Pending", value: "PENDING", color: "text-amber-600" },
  { label: "Confirmed", value: "CONFIRMED", color: "text-blue-600" },
  { label: "Processing", value: "PROCESSING", color: "text-indigo-600" },
  { label: "Shipped", value: "SHIPPED", color: "text-cyan-600" },
  { label: "Delivered", value: "DELIVERED", color: "text-emerald-600" },
  { label: "Cancelled", value: "CANCELLED", color: "text-rose-600" },
  { label: "Returned", value: "RETURNED", color: "text-orange-600" },
];

const OrderStatusCell = ({ order }: { order: IOrder }) => {
  const [updateOrder, { isLoading }] = useUpdateOrderByIdAdminMutation();

  const handleStatusChange = async (newStatus: TOrderStatus) => {
    if (newStatus === order.orderStatus || !order.id) return;
    try {
      await updateOrder({
        id: order.id,
        payload: {
          orderStatus: newStatus,
        },
      }).unwrap();
      toast.success(`Order #${order.invoiceNumber} updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      handleErrors(error as ErrorResponse);
    }
  };

  return (
    <div className="flex items-center gap-1.5 py-1" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isLoading}>
          <button
            type="button"
            className="inline-flex items-center gap-1 group cursor-pointer focus:outline-none"
            title="Click to change order status"
          >
            {isLoading ? (
              <Badge variant="outline" className="text-xs font-medium gap-1 py-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Updating...</span>
              </Badge>
            ) : (
              <div className="flex items-center gap-1 hover:opacity-85 transition-opacity">
                <OrderStatusBadge status={order.orderStatus} />
                <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground">
            Update Status:
          </div>
          {STATUS_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              disabled={isLoading || opt.value === order.orderStatus}
              onClick={() => handleStatusChange(opt.value)}
              className={`flex items-center justify-between text-xs cursor-pointer ${
                opt.value === order.orderStatus ? "font-bold bg-muted" : ""
              }`}
            >
              <span className={opt.color}>{opt.label}</span>
              {opt.value === order.orderStatus && (
                <Check className="w-3.5 h-3.5 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               TABLE COLUMNS                                */
/* -------------------------------------------------------------------------- */
export const columns: ColumnDef<IOrder>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Order & Invoice",
    cell: ({ row }) => <InvoiceCell order={row.original} />,
  },
  {
    accessorKey: "shippingAddress",
    header: "Customer Details",
    cell: ({ row }) => <CustomerCell order={row.original} />,
  },
  {
    accessorKey: "items",
    header: "Products & Qty",
    cell: ({ row }) => <ItemsCell order={row.original} />,
  },
  {
    accessorKey: "payment",
    header: "Payment",
    cell: ({ row }) => <PaymentCell order={row.original} />,
  },
  {
    accessorKey: "pricing.total",
    header: "Amount",
    cell: ({ row }) => <PricingCell order={row.original} />,
  },
  {
    accessorKey: "orderStatus",
    header: "Order Status",
    cell: ({ row }) => <OrderStatusCell order={row.original} />,
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-2">Actions</div>,
    enableSorting: false,
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
