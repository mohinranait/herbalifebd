import { getAuthUser } from "@/lib/authUser";
import { db } from "@/prisma/db";
import { TOrderStatus } from "@/redux/service/orders/type";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const decoded = (await getAuthUser()) as {
      id: string;
      phone: string;
    };

    const userId = decoded?.id;
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Invalid token",
        },
        {
          status: 401,
        }
      );
    }

    const orders = await db.orm.public.Order
      .where({ userId, isDeleted: false })
      .select("orderStatus", "total", "discount")
      .all();

    let totalShopping = 0;
    let totalSaving = 0;

    const ordersByStatus: Record<TOrderStatus, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      RETURNED: 0,
    };

    for (const order of orders) {
      totalShopping += order.total || 0;
      totalSaving += order.discount || 0;

      const status = order.orderStatus as TOrderStatus;
      if (ordersByStatus[status] !== undefined) {
        ordersByStatus[status] += 1;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Customer analytics fetched successfully",
      data: {
        totalOrders: orders.length,
        totalShopping,
        totalSaving,
        ordersByStatus,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Customer analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 500,
      }
    );
  }
}
