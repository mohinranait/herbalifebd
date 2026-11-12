import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get("period") || "week";

    const now = new Date();
    const startDate = new Date();

    if (period === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    }

    const orders = await db.orm.public.Order
      .where({ orderStatus: "DELIVERED" })
      .where((o: any) => o.createdAt.gte(startDate))
      .select("createdAt", "total")
      .orderBy((o: any) => o.createdAt.asc())
      .all();

    const groupedData: Record<string, number> = {};

    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      let key = "";

      if (period === "today") {
        const hour = orderDate.getHours();
        key = `${hour}`;
      } else {
        key = orderDate.toISOString().split("T")[0];
      }

      groupedData[key] = (groupedData[key] || 0) + (order.total || 0);
    }

    const revenueData = Object.entries(groupedData).map(([key, revenue]) => {
      if (period === "today") {
        return {
          _id: { hour: parseInt(key, 10) },
          revenue,
        };
      }
      return {
        _id: { date: key },
        revenue,
      };
    });

    return NextResponse.json({
      success: true,
      data: revenueData,
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
