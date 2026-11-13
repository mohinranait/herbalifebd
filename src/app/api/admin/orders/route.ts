import { NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { formatOrderForUI } from "@/lib/order-utils";
import { getOptionalAuthUser, isAdminUser } from "@/lib/authUser";
import { IOrderSummary } from "@/redux/service/orders/type";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  price?: number | null;
  discountPrice?: number | null;
  costPrice?: number | null;
  stock?: number | null;
  isFreeShipping?: boolean | null;
  productType?: string | null;
  thumbnail?: string | null;
  gallery?: string[] | null;
  isDelete?: boolean | null;
  status?: boolean | null;
};

type ProductVariationRecord = {
  id: string;
  productId: string;
  name?: string | null;
  price?: number | null;
  offerPriceFixed?: number | null;
  costPrice?: number | null;
  stock?: number | null;
  sku?: string | null;
  images?: string[] | null;
};

type PreparedItem = {
  product: ProductRecord;
  variation: ProductVariationRecord | null;
  quantity: number;
  row: Record<string, unknown>;
};

type CreateOrderItemInput = {
  id?: string;
  productId?: string;
  variationId?: string | null;
  productName?: string;
  productImage?: string | null;
  sku?: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
  categoryName?: string;
  brandName?: string;
};

type CreateOrderRequestBody = {
  items?: CreateOrderItemInput[];
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    address?: string;
    postalCode?: string;
  };
  payment?: {
    method?: "COD" | "BKASH" | "NAGAD";
    status?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    transactionId?: string;
  };
  pricing?: {
    shippingCharge?: number;
  };
  customerNote?: string;
  userId?: string | null;
  coupon?: {
    code?: string;
    discountAmount?: number;
  };
};

type ShippingZone = { fee: number | string };

type ShippingConfig = {
  defaultShippingFee?: number | string;
  shippingZones?: ShippingZone[];
};

type QueryFieldAccessor = Record<
  string,
  {
    ne: (val: unknown) => unknown;
    neq: (val: unknown) => unknown;
    eq: (val: unknown) => unknown;
    gte: (val: unknown) => unknown;
    lte: (val: unknown) => unknown;
    ilike: (val: string) => unknown;
    like: (val: string) => unknown;
    desc: () => unknown;
    asc: () => unknown;
  }
>;

/* -------------------------------------------------------------------------- */
/*                              CREATE ORDER API                              */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    const body: CreateOrderRequestBody = await req.json();

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

      const product = (await db.orm.public.Product.first({
        id: cartItem.productId || cartItem.id,
      })) as ProductRecord | null;

      if (!product || product.isDelete || product.status === false) {
        throw new Error(`Product is not available: ${cartItem.productName || "unknown"}`);
      }

      let variation: ProductVariationRecord | null = null;
      let unitPrice: number;
      let unitDiscount: number;
      let unitCost: number | null = product.costPrice ?? null;
      let available: number;

      if (product.productType === "variant") {
        if (!cartItem.variationId) {
          throw new Error(`Variation ID is required for ${product.name}`);
        }

        variation = (await db.orm.public.ProductVariation.first({
          id: cartItem.variationId,
        })) as ProductVariationRecord | null;

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

    let shippingCharge = 0;
    if (needsShipping) {
      const setting = await db.orm.public.AppSetting.first();
      const shipping = (setting?.shipping as ShippingConfig | undefined) || {};
      const zoneFees: number[] = Array.isArray(shipping.shippingZones)
        ? shipping.shippingZones
            .map((zone: ShippingZone) => Number(zone.fee))
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
        const freshVariation = (await db.orm.public.ProductVariation.first({
          id: variation.id,
        })) as ProductVariationRecord | null;
        await db.orm.public.ProductVariation.where({ id: variation.id }).update({
          stock: Math.max(0, (freshVariation?.stock || 0) - quantity),
        });
      }

      const freshProduct = (await db.orm.public.Product.first({
        id: product.id,
      })) as (ProductRecord & { totalSold?: number }) | null;
      await db.orm.public.Product.where({ id: product.id }).update({
        stock: Math.max(0, (freshProduct?.stock || 0) - quantity),
        totalSold: (freshProduct?.totalSold || 0) + quantity,
      });
    }

    let createdOrder: { id: string } | null = null;
    try {
      createdOrder = (await db.orm.public.Order.create({
        invoiceNumber,
        trackingNumber,
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
        paymentStatus: isAdmin ? payment?.status || "PENDING" : "PENDING",
        transactionId: payment?.transactionId || "",
        customerNote: customerNote || "",
        orderStatus: "PENDING",
        isDeleted: false,
      })) as { id: string };

      for (const { row } of prepared) {
        await db.orm.public.OrderItem.create({
          ...row,
          orderId: createdOrder.id,
        });
      }
    } catch (orderCreationError) {
      for (const { product, variation, quantity } of prepared) {
        if (variation) {
          const freshVariation = (await db.orm.public.ProductVariation.first({
            id: variation.id,
          })) as ProductVariationRecord | null;
          await db.orm.public.ProductVariation.where({ id: variation.id }).update({
            stock: (freshVariation?.stock || 0) + quantity,
          });
        }
        const freshProduct = (await db.orm.public.Product.first({
          id: product.id,
        })) as (ProductRecord & { totalSold?: number }) | null;
        await db.orm.public.Product.where({ id: product.id }).update({
          stock: (freshProduct?.stock || 0) + quantity,
          totalSold: Math.max(0, (freshProduct?.totalSold || 0) - quantity),
        });
      }
      throw orderCreationError;
    }

    if (!createdOrder) {
      throw new Error("Failed to create order");
    }

    const fullOrder = await db.orm.public.Order
      .where({ id: createdOrder.id })
      .include("items", (i: { all: () => unknown }) => i.all())
      .include("user", (u: { select: (...args: string[]) => unknown }) => u.select("id", "name", "phone"))
      .first();

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: formatOrderForUI(fullOrder),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Order creation error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to create order",
      },
      { status: 400 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                                GET ORDERS API                              */
/* -------------------------------------------------------------------------- */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const method = searchParams.get("method");
    const paymentStatus = searchParams.get("paymentStatus");
    const isDelete = searchParams.get("isDelete");
    const search = searchParams.get("search")?.trim();
    const date = searchParams.get("date")?.trim();

    const skip = (page - 1) * limit;

    let query = db.orm.public.Order;
    if (isDelete === "true") {
      query = query.where({ isDeleted: true });
    } else {
      query = query.where((o: QueryFieldAccessor) => o.isDeleted.ne(true));
    }

    if (userId) query = query.where({ userId });
    if (status && status !== "all") query = query.where({ orderStatus: status });
    if (method && method !== "all") query = query.where({ paymentMethod: method });
    if (paymentStatus && paymentStatus !== "all") query = query.where({ paymentStatus });

    if (search) {
      const cleanSearch = search.replace(/^#/, "").trim();
      query = query.where((o: QueryFieldAccessor) => o.invoiceNumber.ilike(`%${cleanSearch}%`));
    }

    if (date) {
      const start = new Date(`${date}T00:00:00.000+06:00`);
      const end = new Date(`${date}T23:59:59.999+06:00`);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        query = query
          .where((o: QueryFieldAccessor) => o.createdAt.gte(start))
          .where((o: QueryFieldAccessor) => o.createdAt.lte(end));
      }
    }

    const totalOrders = await query.count();

    const orders = await query
      .include("items", (i: { all: () => unknown }) => i.all())
      .include("user", (u: { select: (...args: string[]) => unknown }) => u.select("id", "name", "phone"))
      .orderBy((o: QueryFieldAccessor) => o.createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();

    // Compute status summary and metrics for tabs and top stat cards
    let summary: IOrderSummary | undefined = undefined;
    try {
      const allActive = await db.orm.public.Order
        .where((o: QueryFieldAccessor) => o.isDeleted.ne(true))
        .select("orderStatus", "total")
        .all();

      const summaryData: IOrderSummary = {
        all: allActive.length,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        returned: 0,
        totalRevenue: 0,
      };

      for (const row of allActive) {
        const s = String(row.orderStatus || "").toLowerCase() as keyof IOrderSummary;
        if (s in summaryData && typeof summaryData[s] === "number") {
          (summaryData[s] as number)++;
        }
        if (row.orderStatus === "DELIVERED") {
          summaryData.totalRevenue += Number(row.total) || 0;
        }
      }

      summary = summaryData;
    } catch (summaryErr) {
      console.error("Failed to compute order summary stats:", summaryErr);
    }

    return NextResponse.json({
      success: true,
      data: orders.map(formatOrderForUI),
      meta: {
        total: totalOrders,
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit) || 1,
        summary,
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
