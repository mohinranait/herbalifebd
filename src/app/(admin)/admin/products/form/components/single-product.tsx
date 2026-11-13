"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TProductFormType } from "@/components/validations/product";
import { UseFormReturn } from "react-hook-form";
import { DollarSign } from "lucide-react";
import SectionCard from "./SectionCard";

type Props = {
  form: UseFormReturn<TProductFormType>;
};

const SingleProduct = ({ form }: Props) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const price = Number(watch("price") || 0);
  const costPrice = Number(watch("costPrice") || 0);
  const discountPrice = Number(watch("discountPrice") || 0);
  const sellingPrice = Math.max(0, price - discountPrice);
  const unitProfit = sellingPrice - costPrice;
  const profitMargin = sellingPrice > 0 ? ((unitProfit / sellingPrice) * 100).toFixed(1) : "0";

  /**
   * Discount Price Change -> updates discount percent
   */
  const handleDiscountPriceChange = (value: number) => {
    if (value < 0) value = 0;
    if (price > 0 && value > price) value = price;

    if (!price || price <= 0) {
      setValue("discountPrice", value, { shouldValidate: true });
      return;
    }

    const percent = Number(((value / price) * 100).toFixed(2));
    setValue("discountPrice", value, { shouldValidate: true });
    setValue("discountParcent", percent, { shouldValidate: true });
  };

  /**
   * Discount Percent Change -> updates discount price
   */
  const handleDiscountPercentChange = (value: number) => {
    if (value < 0) value = 0;
    if (value > 100) value = 100;

    if (!price || price <= 0) {
      setValue("discountParcent", value, { shouldValidate: true });
      return;
    }

    const discountAmount = Number(((price * value) / 100).toFixed(2));
    setValue("discountParcent", value, { shouldValidate: true });
    setValue("discountPrice", discountAmount, { shouldValidate: true });
  };

  /**
   * Price Change
   */
  const handlePriceChange = (value: number) => {
    if (value < 0) value = 0;
    const currentDiscountPrice = Number(watch("discountPrice") || 0);

    setValue("price", value, { shouldValidate: true });

    if (currentDiscountPrice > 0 && value > 0) {
      const percent = Number(((currentDiscountPrice / value) * 100).toFixed(2));
      setValue("discountParcent", percent, { shouldValidate: true });
    }
  };

  return (
    <SectionCard
      icon={<DollarSign size={16} />}
      title="Pricing & Inventory"
      description="Manage product regular price, discounts, cost price, and available stock"
    >
      {/* Financial Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Final Selling Price
          </span>
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">
            ৳ {sellingPrice.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
          </p>
          {discountPrice > 0 && (
            <p className="text-[10px] text-emerald-600 font-semibold">
              ৳ {discountPrice} discount ({watch("discountParcent") || 0}%)
            </p>
          )}
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Estimated Profit per Unit
          </span>
          <p
            className={`text-lg font-black ${
              costPrice > 0
                ? unitProfit >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
                : "text-slate-700 dark:text-slate-300"
            }`}
          >
            ৳ {unitProfit.toFixed(2)}
          </p>
          {costPrice > 0 && (
            <p className="text-[10px] text-slate-400 font-medium">
              Margin: {profitMargin}%
            </p>
          )}
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Current Stock Status
          </span>
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">
            {Number(watch("stock") || 0)} units
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            {Number(watch("stock") || 0) > 0 ? "In Stock" : "Out of Stock"}
          </p>
        </div>
      </div>

      {/* Pricing Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
        {/* Regular Price */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Regular Price <span className="text-rose-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              ৳
            </span>
            <Input
              type="number"
              placeholder="0.00"
              min={0}
              className="pl-8 h-9 text-xs rounded-md font-medium"
              value={watch("price") ?? ""}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
            />
          </div>
          {errors.price && (
            <p className="text-[11px] text-rose-500 font-medium">{errors.price.message}</p>
          )}
        </div>

        {/* Discount Price */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Discount Amount (৳)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              ৳
            </span>
            <Input
              type="number"
              placeholder="0.00"
              min={0}
              className="pl-8 h-9 text-xs rounded-md"
              value={watch("discountPrice") ?? ""}
              onChange={(e) => handleDiscountPriceChange(Number(e.target.value))}
            />
          </div>
          {errors.discountPrice && (
            <p className="text-[11px] text-rose-500 font-medium">{errors.discountPrice.message}</p>
          )}
        </div>

        {/* Discount Percent */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Discount Percent (%)
          </Label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0%"
              min={0}
              max={100}
              className="pr-8 h-9 text-xs rounded-md"
              value={watch("discountParcent") ?? ""}
              onChange={(e) => handleDiscountPercentChange(Number(e.target.value))}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              %
            </span>
          </div>
          {errors.discountParcent && (
            <p className="text-[11px] text-rose-500 font-medium">{errors.discountParcent.message}</p>
          )}
        </div>

        {/* Cost Price */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Cost / Buying Price
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              ৳
            </span>
            <Input
              type="number"
              placeholder="0.00"
              min={0}
              step="0.01"
              className="pl-8 h-9 text-xs rounded-md"
              {...register("costPrice")}
            />
          </div>
          <p className="text-[10px] text-slate-400">Internal only, never shown to customers</p>
        </div>
      </div>

      {/* Stock Field */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Stock Quantity
          </Label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0"
              min={0}
              className="h-9 text-xs rounded-md"
              {...register("stock")}
            />
          </div>
          <p className="text-[10px] text-slate-400">Units currently available in inventory</p>
        </div>
      </div>
    </SectionCard>
  );
};

export default SingleProduct;
