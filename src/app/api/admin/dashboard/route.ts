import { db } from "@/prisma/db";
import { formatOrderForUI } from "@/lib/order-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const deliveredOrders = await db.orm.public.Order
      .where({ orderStatus: "DELIVERED", isDeleted: false })
      .select("total")
      .all();

    const totalOrders = deliveredOrders.length;
    const totalSales = deliveredOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    const recentOrders = await db.orm.public.Order
      .include("user", (u: any) => u.select("id", "name", "phone"))
      .include("items", (i: any) => i.all())
      .orderBy((o: any) => o.createdAt.desc())
      .limit(5)
      .all();

    return NextResponse.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        averageOrderValue,
        totalProducts: 0,
        lastOrders: recentOrders.map(formatOrderForUI),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
