"use client";

import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENCY } from "@/lib/envSecret";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { toggleCartDroware } from "@/redux/features/cartSlice";

type Props = {
  className?: string;
};

const FloatingCartButton = ({ className }: Props) => {
  const dispatch = useAppDispatch();
  const { subtotal, totalItems } = useAppSelector((state) => state.cart);

  const handleClick = () => {
    dispatch(toggleCartDroware());
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Shopping Cart Drawer"
      className={cn(
        `fixed right-0 top-1/2 -translate-y-1/2 z-40
        cursor-pointer overflow-hidden
        rounded-l-2xl border border-slate-200 border-r-0
        bg-white
        hover:scale-105 active:scale-95
        transition-all duration-300
        group select-none outline-hidden`,
        className
      )}
      title="কার্ট ওপেন করুন"
    >
      <div className="flex flex-col min-w-20 md:min-w-22">
        {/* Top: Icon & Item Count */}
        <div className="bg-white px-3 py-2.5 flex flex-col items-center justify-center border-b border-slate-100 transition-colors group-hover:bg-orange-50/40">
          <div className="relative mb-1 transition-transform duration-300 group-hover:scale-110">
            <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </div>
          <span className="text-[11px] md:text-xs font-bold text-slate-800 leading-none">
            {totalItems} টি পণ্য
          </span>
        </div>

        {/* Bottom: Price in Vibrant Orange */}
        <div className="bg-linear-to-b from-orange-500 to-amber-600 text-white py-2 px-3 text-center font-bold text-xs md:text-sm transition-opacity group-hover:opacity-95">
          <span>{CURRENCY} {subtotal}</span>
        </div>
      </div>
    </button>
  );
};

export default FloatingCartButton;
