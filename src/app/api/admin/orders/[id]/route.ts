import { db } from "@/prisma/db";
import { formatOrderForUI } from "@/lib/order-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await db.orm.public.Order
      .where({ id })
      .include("items", (i: any) => i.all())
      .include("user", (u: any) => u.select("id", "name", "phone"))
      .first();

    if (!order) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json({ data: formatOrderForUI(order) });
  } catch (error: any) {
    console.error("Get order Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { id } = await params;
    const { orderStatus, payment } = body;

    const order = await db.orm.public.Order
      .where({ id })
      .include("items", (i: any) => i.all())
      .first();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const previousStatus = order.orderStatus;

    // Restore stock if cancelled or returned
    const shouldRestoreStock =
      !["CANCELLED", "RETURNED"].includes(previousStatus) &&
      ["CANCELLED", "RETURNED"].includes(orderStatus);

    if (shouldRestoreStock && Array.isArray(order.items)) {
      for (const item of order.items) {
        const product = await db.orm.public.Product.first({ id: item.productId });
        if (product) {
          await db.orm.public.Product.where({ id: product.id }).update({
            stock: (product.stock || 0) + item.quantity,
            totalSold: Math.max(0, (product.totalSold || 0) - item.quantity),
          });
        }
        if (item.variationId) {
          const variation = await db.orm.public.ProductVariation.first({ id: item.variationId });
          if (variation) {
            await db.orm.public.ProductVariation.where({ id: variation.id }).update({
              stock: (variation.stock || 0) + item.quantity,
            });
          }
        }
      }
    }

    await db.orm.public.Order.where({ id }).update({
      orderStatus: orderStatus || order.orderStatus,
      paymentStatus: payment?.status || order.paymentStatus,
      paymentMethod: payment?.method || order.paymentMethod,
    });

    const updated = await db.orm.public.Order
      .where({ id })
      .include("items", (i: any) => i.all())
      .include("user", (u: any) => u.select("id", "name", "phone"))
      .first();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: formatOrderForUI(updated),
    });
  } catch (error: any) {
    console.error("Update order Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
