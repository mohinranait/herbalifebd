import { db } from "@/prisma/db";
import { formatOrderForUI } from "@/lib/order-utils";
import { CLOSED_STATUSES, deductOrderStock, restoreOrderStock } from "@/lib/order-stock";
import { NextRequest, NextResponse } from "next/server";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

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
    const { orderStatus, payment, courierName, trackingNumber, adminNote } = body;

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

    if (orderStatus && !ORDER_STATUSES.includes(orderStatus)) {
      return NextResponse.json(
        { success: false, message: `Unknown order status: ${orderStatus}` },
        { status: 400 }
      );
    }

    const wasClosed = CLOSED_STATUSES.includes(previousStatus);
    const willBeClosed = orderStatus ? CLOSED_STATUSES.includes(orderStatus) : wasClosed;

    // Cancelled or returned: goods go back into stock.
    // A cancelled order that is re-opened takes them out again.
    if (!wasClosed && willBeClosed) {
      await restoreOrderStock(order.items);
    } else if (wasClosed && !willBeClosed) {
      await deductOrderStock(order.items);
    }

    await db.orm.public.Order.where({ id }).update({
      orderStatus: orderStatus || order.orderStatus,
      ...(orderStatus === "DELIVERED" && previousStatus !== "DELIVERED" ? { deliveredAt: new Date() } : {}),
      ...(orderStatus === "CANCELLED" && previousStatus !== "CANCELLED" ? { cancelledAt: new Date() } : {}),
      paymentStatus: payment?.status || order.paymentStatus,
      paymentMethod: payment?.method || order.paymentMethod,
      ...(courierName !== undefined ? { courierName } : {}),
      ...(trackingNumber !== undefined ? { trackingNumber } : {}),
      ...(adminNote !== undefined ? { adminNote } : {}),
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

// Deleting an order moves it to the trash (it can be restored) instead of erasing
// the sales record. If its goods were still held for it, they go back into stock.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const isOpen = ![...CLOSED_STATUSES, "DELIVERED"].includes(order.orderStatus);
    if (isOpen) {
      await restoreOrderStock(order.items);
    }

    await db.orm.public.Order.where({ id }).update({
      isDeleted: true,
      ...(isOpen ? { orderStatus: "CANCELLED", cancelledAt: new Date() } : {}),
    });

    return NextResponse.json({
      success: true,
      message: "Order moved to trash",
      data: formatOrderForUI({ ...order, isDeleted: true }),
    });
  } catch (error: any) {
    console.error("Delete order Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
