"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { TProductFormType } from "@/components/validations/product";

import { UseFormReturn } from "react-hook-form";

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
  const sellingPrice = price - Number(watch("discountPrice") || 0);
  const unitProfit = sellingPrice - costPrice;

  /**
   * Discount Price Change
   */
  const handleDiscountPriceChange = (value: number) => {
    // prevent negative
    if (value < 0) value = 0;

    if (!price || price <= 0) {
      setValue("discountPrice", value);
      return;
    }

    const percent = Number(((value / price) * 100).toFixed(2));

    setValue("discountPrice", value);
    setValue("discountParcent", percent);
  };

  /**
   * Discount Percent Change
   */
  const handleDiscountPercentChange = (value: number) => {
    // prevent negative
    if (value < 0) value = 0;

    // prevent over 100%
    if (value > 100) value = 100;

    if (!price || price <= 0) {
      setValue("discountParcent", value);
      return;
    }

    const discountPrice = Number(((price * value) / 100).toFixed(2));

    setValue("discountParcent", value);
    setValue("discountPrice", discountPrice);
  };

  /**
   * Price Change
   * Keep discount price fixed
   */
  const handlePriceChange = (value: number) => {
    // prevent negative
    if (value < 0) value = 0;

    const currentDiscountPrice = Number(watch("discountPrice") || 0);

    setValue("price", value);

    if (currentDiscountPrice > 0 && value > 0) {
      const percent = Number(
        ((currentDiscountPrice / value) * 100).toFixed(2)
      );

      setValue("discountParcent", percent);
    }
  };

  return (
    <div className="border rounded-2xl p-6 bg-white shadow-sm space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Pricing & Stock
        </h2>

        <p className="text-sm text-muted-foreground">
          Manage product pricing, discounts and inventory.
        </p>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Price */}
        <div className="space-y-2">
          <Label>Regular Price</Label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ৳
            </span>

            <Input
              type="number"
              placeholder="0.00"
              min={0}
              className="pl-8 h-11"
              value={watch("price") || ""}
              onChange={(e) =>
                handlePriceChange(Number(e.target.value))
              }
            />
          </div>
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <Label>Stock Quantity</Label>

          <Input
            type="number"
            placeholder="0"
             min={0}
            className="h-11"
            {...register("stock")}
          />
        </div>

        {/* Cost Price */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="cost-price">Cost Price (your buying price)</Label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ৳
            </span>

            <Input
              id="cost-price"
              type="number"
              placeholder="0.00"
              min={0}
              step="0.01"
              className="pl-8 h-11"
              {...register("costPrice")}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Never shown to customers. Used for the profit &amp; loss report.
            {costPrice > 0 && sellingPrice > 0 && (
              <span className={unitProfit >= 0 ? " font-medium text-emerald-600" : " font-medium text-red-600"}>
                {" "}
                {unitProfit >= 0 ? "Profit" : "Loss"} per unit: ৳{Math.abs(unitProfit).toFixed(2)}
              </span>
            )}
          </p>
        </div>

        {/* Discount Price */}
        <div className="space-y-2">
          <Label>Discount Price</Label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ৳
            </span>

            <Input
              type="number"
              placeholder="0.00"
               min={0}
              className="pl-8 h-11"
              value={watch("discountPrice") || ""}
              onChange={(e) =>
                handleDiscountPriceChange(Number(e.target.value))
              }
            />
          </div>
        </div>

        {/* Discount Percent */}
        <div className="space-y-2">
          <Label>Discount Percent</Label>

          <div className="relative">
            <Input
              type="number"
              placeholder="0%"
               min={0}
              className="pr-8 h-11"
              value={watch("discountParcent") || ""}
              onChange={(e) =>
                handleDiscountPercentChange(Number(e.target.value))
              }
            />

            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              %
            </span>
          </div>
        </div>
      </div>

      {/* Errors */}
      <div className="space-y-1">
        {errors.price && (
          <p className="text-sm text-red-500">
            {errors.price.message}
          </p>
        )}

        {errors.costPrice && (
          <p className="text-sm text-red-500">
            {errors.costPrice.message}
          </p>
        )}

        {errors.discountPrice && (
          <p className="text-sm text-red-500">
            {errors.discountPrice.message}
          </p>
        )}

        {errors.discountParcent && (
          <p className="text-sm text-red-500">
            {errors.discountParcent.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default SingleProduct;