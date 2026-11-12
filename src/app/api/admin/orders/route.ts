import { NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { formatOrderForUI } from "@/lib/order-utils";

/* -------------------------------------------------------------------------- */
/*                              CREATE ORDER API                              */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      items,
      shippingAddress,
      payment,
      coupon,
      customerNote,
      pricing,
    } = body;

    /* ---------------------------------------------------------------------- */
    /*                               VALIDATION                               */
    /* ---------------------------------------------------------------------- */

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Order items are required");
    }

    if (!shippingAddress) {
      throw new Error("Shipping address is required");
    }

    /* ---------------------------------------------------------------------- */
    /*                              PROCESS ORDER ITEMS                       */
    /* ---------------------------------------------------------------------- */

    const orderItemsData = [];
    let subtotal = 0;
    let totalQuantity = 0;

    for (const cartItem of items) {
      const product = await db.orm.public.Product.first({
        id: cartItem.productId || cartItem._id,
      });

      if (!product) {
        throw new Error(`Product not found: ${cartItem.productName}`);
      }

      const { productType, quantity: requestedQty, variationId } = cartItem;

      /* --------------------------- STOCK CHECK & UPDATE --------------------------- */

      if (productType === "single") {
        if ((product.stock || 0) < requestedQty) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock || 0}, Requested: ${requestedQty}`
          );
        }

        await db.orm.public.Product.where({ id: product.id }).update({
          stock: Math.max(0, (product.stock || 0) - requestedQty),
          totalSold: (product.totalSold || 0) + requestedQty,
        });
      } else {
        if (!variationId) {
          throw new Error(`Variation ID is required for ${product.name}`);
        }

        const variation = await db.orm.public.ProductVariation.first({
          id: variationId,
        });

        if (!variation) {
          throw new Error(`Variation not found for ${product.name}`);
        }

        if ((variation.stock || 0) < requestedQty) {
          throw new Error(
            `Insufficient stock for ${product.name} (${variation.name || "Variant"}). Available: ${variation.stock || 0}, Requested: ${requestedQty}`
          );
        }

        await db.orm.public.ProductVariation.where({ id: variation.id }).update({
          stock: Math.max(0, (variation.stock || 0) - requestedQty),
        });

        await db.orm.public.Product.where({ id: product.id }).update({
          stock: Math.max(0, (product.stock || 0) - requestedQty),
          totalSold: (product.totalSold || 0) + requestedQty,
        });
      }

      /* ------------------------------ PRICE CALCULATION ------------------------------- */

      const itemSubtotal = (cartItem.salePrice || cartItem.price) * requestedQty;
      subtotal += itemSubtotal;
      totalQuantity += requestedQty;

      orderItemsData.push({
        productId: product.id,
        variationId: cartItem.variationId || null,
        productName: cartItem.productName,
        productImage: cartItem.productImage || null,
        productSlug: cartItem.productSlug || "",
        sku: cartItem.sku || "",
        quantity: requestedQty,
        price: parseFloat(cartItem.price) || 0,
        salePrice: parseFloat(cartItem.salePrice || cartItem.price) || 0,
        subtotal: itemSubtotal,
        selectedVariants: cartItem.selectedVariants || null,
        categoryName: cartItem.categoryName || "",
        brandName: cartItem.brandName || "",
      });
    }

    /* ---------------------------------------------------------------------- */
    /*                                PRICING                                 */
    /* ---------------------------------------------------------------------- */

    const shippingCharge = pricing?.shippingCharge || 0;
    const couponDiscount = coupon?.discountAmount || 0;
    const total = subtotal - couponDiscount + shippingCharge;

    const invoiceNumber = `INV-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const trackingNumber = `TR-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;

    /* ---------------------------------------------------------------------- */
    /*                              CREATE ORDER                              */
    /* ---------------------------------------------------------------------- */

    const createdOrder = await db.orm.public.Order.create({
      invoiceNumber,
      trackingNumber,
      userId: userId || null,
      totalItems: orderItemsData.length,
      totalQuantity,
      subtotal,
      discount: couponDiscount,
      shippingCharge,
      tax: 0,
      total,
      couponCode: coupon?.code || "",
      couponDiscount,
      fullName: shippingAddress.fullName || "",
      phone: shippingAddress.phone || "",
      address: shippingAddress.address || "",
      postalCode: shippingAddress.postalCode || "",
      paymentMethod: payment?.method || "COD",
      paymentStatus: payment?.status || "PENDING",
      transactionId: payment?.transactionId || "",
      customerNote: customerNote || "",
      orderStatus: "PENDING",
    });

    for (const item of orderItemsData) {
      await db.orm.public.OrderItem.create({
        ...item,
        orderId: createdOrder.id,
      });
    }

    const fullOrder = await db.orm.public.Order
      .where({ id: createdOrder.id })
      .include("items", (i: any) => i.all())
      .include("user", (u: any) => u.select("id", "name", "phone"))
      .first();

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: formatOrderForUI(fullOrder),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create order",
      },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const method = searchParams.get("method");

    const skip = (page - 1) * limit;

    let query = db.orm.public.Order.where({ isDeleted: false });

    if (userId) query = query.where({ userId });
    if (status) query = query.where({ orderStatus: status });
    if (method) query = query.where({ paymentMethod: method });

    const orders = await query
      .include("items", (i: any) => i.all())
      .include("user", (u: any) => u.select("id", "name", "phone"))
      .orderBy((o: any) => o.createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();

    const formattedOrders = orders.map(formatOrderForUI);
    const totalOrders = orders.length;

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      meta: {
        total: totalOrders,
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit) || 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
