export function formatOrderForUI(order: any) {
  if (!order) return order;

  return {
    ...order,
    pricing: {
      subtotal: order.subtotal ?? 0,
      discount: order.discount ?? 0,
      shippingCharge: order.shippingCharge ?? 0,
      tax: order.tax ?? 0,
      total: order.total ?? 0,
    },
    coupon: {
      code: order.couponCode ?? "",
      discountAmount: order.couponDiscount ?? 0,
    },
    shippingAddress: {
      fullName: order.fullName ?? "",
      phone: order.phone ?? "",
      address: order.address ?? "",
      postalCode: order.postalCode ?? "",
    },
    payment: {
      method: order.paymentMethod ?? "COD",
      status: order.paymentStatus ?? "PENDING",
      transactionId: order.transactionId ?? "",
      paidAt: order.paidAt ?? null,
    },
    items: Array.isArray(order.items)
      ? order.items
      : [],
    userId: order.user
      ? {
          id: order.user.id,
          name: order.user.name,
          phone: order.user.phone,
        }
      : order.userId,
  };
}
