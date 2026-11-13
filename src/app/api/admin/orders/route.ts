import { NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { formatOrderForUI } from "@/lib/order-utils";
import { getOptionalAuthUser, isAdminUser } from "@/lib/authUser";
import { MongoFieldFilter, MongoOrExpr } from "@prisma/orm-mongo/query-ast/execution";

/* -------------------------------------------------------------------------- */
/*                              CREATE ORDER API                              */
/* -------------------------------------------------------------------------- */

type PreparedItem = {
  product: any;
  variation: any | null;
  quantity: number;
  row: Record<string, unknown>;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { items, shippingAddress, payment, customerNote, pricing } = body;

    /* ---------------------------------------------------------------------- */
    /*                               VALIDATION                               */
    /* ---------------------------------------------------------------------- */

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Order items are required");
    }

    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.address) {
      throw new Error("Shipping name, phone and address are required");
    }

    const requester = await getOptionalAuthUser();
    const isAdmin = isAdminUser(requester);

    /* ---------------------------------------------------------------------- */
    /*                     STEP 1: CHECK EVERY ITEM FIRST                     */
    /* ---------------------------------------------------------------------- */
    // Prices and costs always come from the database, never from the request.
    // Nothing is written until every item has passed, so a failing item cannot
    // leave earlier items with reduced stock and no order.

    const prepared: PreparedItem[] = [];
    const requestedByStockKey = new Map<string, number>();
    let subtotal = 0;
    let totalQuantity = 0;
    let needsShipping = false;

    for (const cartItem of items) {
      const quantity = Math.floor(Number(cartItem.quantity));
      if (!Number.isFinite(quantity) || quantity < 1) {
        throw new Error(`Invalid quantity for ${cartItem.productName || "an item"}`);
      }

      const product = await db.orm.public.Product.first({
        id: cartItem.productId || cartItem.id,
      });

      if (!product || product.isDelete || product.status === false) {
        throw new Error(`Product is not available: ${cartItem.productName || "unknown"}`);
      }

      let variation: any = null;
      let unitPrice: number;
      let unitDiscount: number;
      let unitCost: number | null = product.costPrice ?? null;
      let available: number;

      if (product.productType === "variant") {
        if (!cartItem.variationId) {
          throw new Error(`Variation ID is required for ${product.name}`);
        }

        variation = await db.orm.public.ProductVariation.first({ id: cartItem.variationId });
        if (!variation || String(variation.productId) !== String(product.id)) {
          throw new Error(`Variation not found for ${product.name}`);
        }

        unitPrice = variation.price || 0;
        unitDiscount = variation.offerPriceFixed || 0;
        available = variation.stock || 0;
        if (variation.costPrice !== null && variation.costPrice !== undefined) {
          unitCost = variation.costPrice;
        }
      } else {
        unitPrice = product.price || 0;
        unitDiscount = product.discountPrice || 0;
        available = product.stock || 0;
      }

      const salePrice = Math.max(0, unitPrice - unitDiscount);
      if (salePrice <= 0) {
        throw new Error(`${product.name} has no price set and cannot be ordered`);
      }

      // The same product can appear in the cart more than once
      const stockKey = variation ? `v:${variation.id}` : `p:${product.id}`;
      const requestedSoFar = (requestedByStockKey.get(stockKey) || 0) + quantity;
      if (available < requestedSoFar) {
        const label = variation ? `${product.name} (${variation.name || "Variant"})` : product.name;
        throw new Error(
          `Insufficient stock for ${label}. Available: ${available}, Requested: ${requestedSoFar}`
        );
      }
      requestedByStockKey.set(stockKey, requestedSoFar);

      if (!product.isFreeShipping) needsShipping = true;

      const itemSubtotal = salePrice * quantity;
      subtotal += itemSubtotal;
      totalQuantity += quantity;

      prepared.push({
        product,
        variation,
        quantity,
        row: {
          productId: product.id,
          variationId: variation?.id || null,
          productName: product.name,
          productImage:
            variation?.images?.[0] || product.thumbnail || product.gallery?.[0] || cartItem.productImage || null,
          productSlug: product.slug,
          sku: variation?.sku || cartItem.sku || "",
          quantity,
          price: unitPrice,
          salePrice,
          // Buying cost at the moment of sale, so later cost changes do not
          // rewrite the profit of past orders
          costPrice: unitCost,
          subtotal: itemSubtotal,
          selectedVariants: cartItem.selectedVariants || null,
          categoryName: cartItem.categoryName || "",
          brandName: cartItem.brandName || "",
        },
      });
    }

    /* ---------------------------------------------------------------------- */
    /*                                PRICING                                 */
    /* ---------------------------------------------------------------------- */

    // The delivery charge must be one the shop actually offers
    let shippingCharge = 0;
    if (needsShipping) {
      const setting = await db.orm.public.AppSetting.first();
      const shipping = (setting?.shipping as any) || {};
      const zoneFees: number[] = Array.isArray(shipping.shippingZones)
        ? shipping.shippingZones
            .map((zone: any) => Number(zone.fee))
            .filter((fee: number) => Number.isFinite(fee))
        : [];
      const requestedFee = Number(pricing?.shippingCharge);

      if (zoneFees.length === 0) {
        shippingCharge = Number(shipping.defaultShippingFee) || 0;
      } else if (zoneFees.includes(requestedFee)) {
        shippingCharge = requestedFee;
      } else if (isAdmin && Number.isFinite(requestedFee) && requestedFee >= 0) {
        shippingCharge = requestedFee;
      } else {
        throw new Error("Please select a delivery area");
      }
    }

    // There is no coupon system yet, so a discount sent with the order is only
    // honoured when an admin creates the order by hand.
    const requestedDiscount = Number(body.coupon?.discountAmount) || 0;
    const couponDiscount = isAdmin ? Math.min(Math.max(requestedDiscount, 0), subtotal) : 0;
    const couponCode = isAdmin ? body.coupon?.code || "" : "";

    const total = subtotal - couponDiscount + shippingCharge;

    let invoiceNumber = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      const stamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).slice(2, 5).toUpperCase();
      invoiceNumber = `INV-${stamp}${random}`;
      const taken = await db.orm.public.Order.where({ invoiceNumber }).first();
      if (!taken) break;
    }
    const trackingNumber = `TR-${Math.random().toString(36).slice(2, 12).toUpperCase()}`;

    /* ---------------------------------------------------------------------- */
    /*                  STEP 2: REDUCE STOCK, THEN CREATE ORDER               */
    /* ---------------------------------------------------------------------- */

    for (const { product, variation, quantity } of prepared) {
      if (variation) {
        const freshVariation = await db.orm.public.ProductVariation.first({ id: variation.id });
        await db.orm.public.ProductVariation.where({ id: variation.id }).update({
          stock: Math.max(0, (freshVariation?.stock || 0) - quantity),
        });
      }

      // Re-read so two lines for the same product do not overwrite each other
      const freshProduct = await db.orm.public.Product.first({ id: product.id });
      await db.orm.public.Product.where({ id: product.id }).update({
        stock: Math.max(0, (freshProduct?.stock || 0) - quantity),
        totalSold: (freshProduct?.totalSold || 0) + quantity,
      });
    }

    let createdOrder: any = null;
    try {
      createdOrder = await db.orm.public.Order.create({
        invoiceNumber,
        trackingNumber,
        // A customer orders for themselves; only an admin may place an order for someone else
        userId: isAdmin ? body.userId || null : requester?.id || null,
        totalItems: prepared.length,
        totalQuantity,
        subtotal,
        discount: couponDiscount,
        shippingCharge,
        tax: 0,
        total,
        couponCode,
        couponDiscount,
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        postalCode: shippingAddress.postalCode || "",
        paymentMethod: payment?.method || "COD",
        // Payment is confirmed by an admin, not by the request
        paymentStatus: isAdmin ? payment?.status || "PENDING" : "PENDING",
        transactionId: payment?.transactionId || "",
        customerNote: customerNote || "",
        orderStatus: "PENDING",
        // Must be an explicit false: the order lists filter on `isDeleted: false`
        isDeleted: false,
      });

      for (const { row } of prepared) {
        await db.orm.public.OrderItem.create({
          ...row,
          orderId: createdOrder.id,
        });
      }
    } catch (orderCreationError) {
      // Rollback stock deduction if order or item creation fails
      for (const { product, variation, quantity } of prepared) {
        if (variation) {
          const freshVariation = await db.orm.public.ProductVariation.first({ id: variation.id });
          await db.orm.public.ProductVariation.where({ id: variation.id }).update({
            stock: (freshVariation?.stock || 0) + quantity,
          });
        }
        const freshProduct = await db.orm.public.Product.first({ id: product.id });
        await db.orm.public.Product.where({ id: product.id }).update({
          stock: (freshProduct?.stock || 0) + quantity,
          totalSold: Math.max(0, (freshProduct?.totalSold || 0) - quantity),
        });
      }
      throw orderCreationError;
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
    const isDelete = searchParams.get("isDelete");

    const skip = (page - 1) * limit;

    let query = db.orm.public.Order.where({ isDeleted: isDelete === "true" });

    if (userId) query = query.where({ userId });
    if (status) query = query.where({ orderStatus: status });
    if (method) query = query.where({ paymentMethod: method });

    const totalOrders = await query.count();

    const orders = await query
      .include("items", (i: any) => i.all())
      .include("user", (u: any) => u.select("id", "name", "phone"))
      .orderBy((o: any) => o.createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();

    return NextResponse.json({
      success: true,
      data: orders.map(formatOrderForUI),
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
