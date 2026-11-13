import { db } from "@/prisma/db";
import { format } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

type QueryFieldAccessor = Record<
  string,
  {
    ne: (val: unknown) => unknown;
    gte: (val: unknown) => unknown;
    asc: () => unknown;
  }
>;

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
    } else if (period === "year") {
      startDate.setMonth(now.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // month (last 30 days)
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    }

    const orders = await db.orm.public.Order
      .where({ orderStatus: "DELIVERED" })
      .where((o: QueryFieldAccessor) => o.isDeleted.ne(true))
      .where((o: QueryFieldAccessor) => o.createdAt.gte(startDate))
      .select("createdAt", "total")
      .orderBy((o: QueryFieldAccessor) => o.createdAt.asc())
      .all();

    // Pre-populate time slots so the chart renders a continuous line
    const slots: { id: string; label: string; revenue: number; orders: number }[] = [];

    if (period === "today") {
      const currentHour = now.getHours();
      for (let h = 0; h <= currentHour; h++) {
        const hStr = h < 10 ? `0${h}` : `${h}`;
        const label = format(new Date().setHours(h, 0, 0, 0), "ha");
        slots.push({ id: hStr, label, revenue: 0, orders: 0 });
      }

      for (const order of orders) {
        const orderHour = new Date(order.createdAt).getHours();
        const found = slots.find((s) => parseInt(s.id, 10) === orderHour);
        if (found) {
          found.revenue += Number(order.total) || 0;
          found.orders += 1;
        }
      }
    } else if (period === "year") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const id = format(d, "yyyy-MM");
        const label = format(d, "MMM yyyy");
        slots.push({ id, label, revenue: 0, orders: 0 });
      }

      for (const order of orders) {
        const mKey = format(new Date(order.createdAt), "yyyy-MM");
        const found = slots.find((s) => s.id === mKey);
        if (found) {
          found.revenue += Number(order.total) || 0;
          found.orders += 1;
        }
      }
    } else {
      // Days (7 days for week, 30 days for month)
      const numDays = period === "week" ? 7 : 30;
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const id = format(d, "yyyy-MM-dd");
        const label = format(d, period === "week" ? "EEE, dd MMM" : "dd MMM");
        slots.push({ id, label, revenue: 0, orders: 0 });
      }

      for (const order of orders) {
        const dKey = format(new Date(order.createdAt), "yyyy-MM-dd");
        const found = slots.find((s) => s.id === dKey);
        if (found) {
          found.revenue += Number(order.total) || 0;
          found.orders += 1;
        }
      }
    }

    const totalRevenue = slots.reduce((s, x) => s + x.revenue, 0);
    const totalOrders = slots.reduce((s, x) => s + x.orders, 0);

    return NextResponse.json({
      success: true,
      data: slots,
      meta: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Dashboard revenue query error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
