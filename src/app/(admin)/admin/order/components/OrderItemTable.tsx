"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Printer, Loader2, ExternalLink, Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IOrder } from "@/redux/service/orders/type";
import { PRODUCT_IMG } from "@/lib/default-import";
import { CURRENCY } from "@/lib/envSecret";
import { formateDownloadInvoice } from "@/app/(root)/dashboard/orders/[orderId]/components/download-invoice";
import { toast } from "sonner";

interface Props {
  order: IOrder;
}

const OrderItemTable: React.FC<Props> = ({ order }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const items = order?.items || [];
  const pricing = order?.pricing;
  const shipping = order?.shippingAddress;

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      await formateDownloadInvoice(order);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Invoice download failed:", error);
      toast.error("Failed to generate invoice.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="border border-slate-200/90 shadow-xs rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">Ordered Items</h3>
            <p className="text-xs text-slate-400">
              Total {items.length} item(s) • Invoice #{order?.invoiceNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrint}
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-md border-slate-200 text-slate-700 hover:bg-slate-100 gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </Button>

          <Button
            onClick={handleDownloadInvoice}
            disabled={isDownloading}
            type="button"
            size="sm"
            className="h-8 px-2.5 sm:px-3 text-xs font-bold rounded-md bg-orange-500 hover:bg-orange-600 text-white gap-1.5 shadow-xs"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Invoice PDF</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Invoice Meta Grid */}
      <div className="p-4 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-md bg-slate-50/70 border border-slate-100 space-y-1">
          <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">
            Seller / Merchant
          </p>
          <p className="text-sm font-bold text-orange-600">Herbalife BD</p>
          <p className="text-slate-600">Dhaka, Bangladesh</p>
          <p className="text-slate-600">Hotline: +880 1728-068200</p>
        </div>

        <div className="p-3 rounded-md bg-slate-50/70 border border-slate-100 space-y-1">
          <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">
            Customer (Bill To)
          </p>
          <p className="text-sm font-bold text-slate-800">{shipping?.fullName || "N/A"}</p>
          <p className="text-slate-600">
            Mobile:{" "}
            <a href={`tel:${shipping?.phone}`} className="font-semibold text-slate-800 hover:underline">
              {shipping?.phone}
            </a>
          </p>
          <p className="text-slate-600">
            Address: {shipping?.address} {shipping?.postalCode ? `(${shipping.postalCode})` : ""}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="border-b border-slate-200 hover:bg-transparent">
              <TableHead className="text-xs font-bold text-slate-700 py-3 pl-4">Product Details</TableHead>
              <TableHead className="text-xs font-bold text-slate-700 py-3 text-center">Qty</TableHead>
              <TableHead className="text-xs font-bold text-slate-700 py-3 text-right">Unit Price</TableHead>
              <TableHead className="text-xs font-bold text-slate-700 py-3 text-right pr-4">Total Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, i) => {
              const unitPrice = item.salePrice || item.price || 0;
              const lineTotal = unitPrice * item.quantity;

              return (
                <TableRow key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-md overflow-hidden border border-slate-200 bg-white shrink-0">
                        <Image
                          src={item.productImage || PRODUCT_IMG}
                          alt={item.productName || "Product"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <Link
                          href={`/product/${item.productSlug || item.productId}`}
                          target="_blank"
                          className="group inline-flex items-center gap-1 font-semibold text-xs text-slate-800 hover:text-orange-600 transition-colors"
                        >
                          <span className="line-clamp-1">{item.productName}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        {item.sku && (
                          <p className="text-[11px] font-mono text-slate-400">SKU: {item.sku}</p>
                        )}
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {Object.entries(item.selectedVariants).map(([k, v]) => (
                              <span
                                key={k}
                                className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-orange-50 text-orange-700 border border-orange-100"
                              >
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-xs text-slate-800 py-3">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold text-slate-700 py-3">
                    {CURRENCY} {unitPrice.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right text-xs font-bold text-slate-900 py-3 pr-4">
                    {CURRENCY} {lineTotal.toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter className="bg-slate-50/70 border-t border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={3} className="text-right text-xs text-slate-500 py-2 font-medium">
                Subtotal
              </TableCell>
              <TableCell className="text-right text-xs font-bold text-slate-800 py-2 pr-4">
                {CURRENCY} {(pricing?.subtotal || 0).toLocaleString("en-IN")}
              </TableCell>
            </TableRow>
            {pricing?.shippingCharge ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="text-right text-xs text-slate-500 py-2 font-medium">
                  Shipping Fee
                </TableCell>
                <TableCell className="text-right text-xs font-bold text-slate-800 py-2 pr-4">
                  {CURRENCY} {pricing.shippingCharge.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            ) : null}
            {pricing?.tax && pricing.tax > 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="text-right text-xs text-slate-500 py-2 font-medium">
                  Tax / VAT
                </TableCell>
                <TableCell className="text-right text-xs font-bold text-slate-800 py-2 pr-4">
                  {CURRENCY} {pricing.tax.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            ) : null}
            {pricing?.discount && pricing.discount > 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="text-right text-xs text-emerald-600 py-2 font-medium">
                  Coupon Discount ({order.coupon?.code || "Discount"})
                </TableCell>
                <TableCell className="text-right text-xs font-bold text-emerald-600 py-2 pr-4">
                  - {CURRENCY} {pricing.discount.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            ) : null}
            <TableRow className="hover:bg-transparent border-t-2 border-slate-200">
              <TableCell colSpan={3} className="text-right text-sm font-extrabold text-slate-900 py-3">
                Grand Total
              </TableCell>
              <TableCell className="text-right text-base font-extrabold text-orange-600 py-3 pr-4">
                {CURRENCY} {(pricing?.total || 0).toLocaleString("en-IN")}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Customer Note if present */}
      {order?.customerNote && (
        <div className="p-3.5 m-4 rounded-md bg-amber-50/80 border border-amber-200 text-xs">
          <p className="font-bold text-amber-900 mb-0.5">Customer Note:</p>
          <p className="text-amber-800">{order.customerNote}</p>
        </div>
      )}
    </Card>
  );
};

export default OrderItemTable;
