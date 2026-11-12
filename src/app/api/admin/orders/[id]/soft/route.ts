import { db } from "@/prisma/db";
import { formatOrderForUI } from "@/lib/order-utils";
import { NextRequest, NextResponse } from "next/server";

// Toggle an order between the trash and the normal list
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const order = await db.orm.public.Order.where({ id }).first();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const isDeleted = !order.isDeleted;
    await db.orm.public.Order.where({ id }).update({ isDeleted });

    return NextResponse.json({
      success: true,
      message: isDeleted ? "Moved to trash" : "Restored successfully",
      data: formatOrderForUI({ ...order, isDeleted }),
    });
  } catch (error: any) {
    console.error("Soft delete order Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
