

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICartItem } from "../service/orders/type";

type TCartState = {
  carts: ICartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  open: boolean;
};

const initialState: TCartState = {
  carts: [],
  totalItems: 0,
  subtotal: 0,
  discount: 0,
  open: false,
};


const calculateSubtotal = (carts: ICartItem[]) => {
  return carts.reduce((total, item) => {
    return total + item.salePrice * item.quantity;
  }, 0);
};

const calculateTotalQuantity = (carts: ICartItem[]) => {
  return carts.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
};


const isSameCartItem = (
  item: ICartItem,
  target: {
    productId: string;
    sku?: string;
    variationId?: string | null;
    selectedVariants?: Record<string, string>;
  }
) => {
  if (item.productId !== target.productId) return false;
  if (target.variationId || item.variationId) {
    return String(target.variationId || "") === String(item.variationId || "");
  }
  if (target.selectedVariants && item.selectedVariants) {
    return JSON.stringify(item.selectedVariants) === JSON.stringify(target.selectedVariants);
  }
  return item.sku === target.sku;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ cart: ICartItem }>) => {
      const { cart } = action.payload;
      const existingItemIndex = state.carts.findIndex((item) =>
        isSameCartItem(item, cart)
      );

      let updatedCart: ICartItem[];
      if (existingItemIndex > -1) {
        updatedCart = [...state.carts];
        updatedCart[existingItemIndex].quantity += cart.quantity;
      } else {
        updatedCart = [...state.carts, cart];
      }
      state.carts = updatedCart;
      state.totalItems = calculateTotalQuantity(state.carts);
      state.subtotal = calculateSubtotal(state.carts);
    },
    removeToCart: (
      state,
      action: PayloadAction<{
        productId: string;
        sku?: string;
        variationId?: string | null;
        selectedVariants?: Record<string, string>;
      }>
    ) => {
      state.carts = state.carts.filter(
        (item) => !isSameCartItem(item, action.payload)
      );

      state.totalItems = calculateTotalQuantity(state.carts);
      state.subtotal = calculateSubtotal(state.carts);
    },
    toggleCartDroware: (state) => {
      state.open = !state.open;
    },
    updateCartQuantity: (
      state,
      action: PayloadAction<{
        productId: string;
        sku?: string;
        variationId?: string | null;
        selectedVariants?: Record<string, string>;
        quantity: number;
      }>
    ) => {
      const { quantity } = action.payload;

      const itemIndex = state.carts.findIndex((item) =>
        isSameCartItem(item, action.payload)
      );

      if (itemIndex > -1) {
        if (quantity <= 0) {
          state.carts.splice(itemIndex, 1);
        } else {
          state.carts[itemIndex].quantity = quantity;
        }
      }

      state.totalItems = calculateTotalQuantity(state.carts);
      state.subtotal = calculateSubtotal(state.carts);
    },

    clearShoppingCarts: (state) => {
      state.carts = []
      state.totalItems = 0
      state.subtotal = 0
      state.discount = 0
    }
  },
});

export const { addToCart, removeToCart, toggleCartDroware, updateCartQuantity,clearShoppingCarts } = cartSlice.actions;
export default cartSlice.reducer;
