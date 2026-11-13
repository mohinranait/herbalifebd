"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquarePlus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks/hooks";
import { CURRENCY } from "@/lib/envSecret";
import { setCommentModal } from "@/redux/features/uiSlice";
import { IOrderItem } from "@/redux/service/orders/type";
import { PRODUCT_IMG } from "@/lib/default-import";

interface OrderItemProps {
  item: IOrderItem;
}

const OrderItem: React.FC<OrderItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  const unitPrice = item.salePrice || item.price || 0;
  const itemTotal = unitPrice * item.quantity;

  const handleOpenReview = () => {
    dispatch(
      setCommentModal({
        name: item.productName,
        pId: item.productId,
        image: item.productImage,
      })
    );
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-md gap-3.5 transition-colors">
      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
        <div className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border border-slate-200 bg-white">
          <Image
            src={item.productImage || PRODUCT_IMG}
            alt={item.productName || "Product"}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <Link
            href={`/product/${item.productSlug || item.productId}`}
            className="group inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-800 hover:text-brand transition-colors line-clamp-1"
          >
            <span>{item.productName}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>
              মূল্য: <strong className="text-slate-700">{CURRENCY} {unitPrice.toLocaleString("en-IN")}</strong>
            </span>
            <span>•</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">
              পরিমাণ: {item.quantity}
            </span>
            {item.sku && (
              <>
                <span>•</span>
                <span className="text-[11px] font-mono text-slate-400">SKU: {item.sku}</span>
              </>
            )}
          </div>

          {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {Object.entries(item.selectedVariants).map(([k, v]) => (
                <span
                  key={k}
                  className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-brand-light text-brand border border-brand-border"
                >
                  {k}: {String(v)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <div className="text-left sm:text-right">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">মোট মূল্য</p>
          <p className="text-sm sm:text-base font-extrabold text-brand">
            {CURRENCY} {itemTotal.toLocaleString("en-IN")}
          </p>
        </div>

        <Button
          onClick={handleOpenReview}
          type="button"
          size="sm"
          variant="outline"
          className="h-8 px-2.5 text-xs font-semibold rounded-md border-slate-200 text-slate-700 hover:bg-white hover:text-brand hover:border-brand-border gap-1.5 transition-all shadow-xs"
        >
          <MessageSquarePlus className="w-3.5 h-3.5 text-brand" />
          <span>মতামত</span>
        </Button>
      </div>
    </div>
  );
};

export default OrderItem;
