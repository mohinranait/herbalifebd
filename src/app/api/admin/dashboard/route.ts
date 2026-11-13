import { db } from "@/prisma/db";
import { formatOrderForUI } from "@/lib/order-utils";
import { NextRequest, NextResponse } from "next/server";

type QueryFieldAccessor = Record<
  string,
  {
    ne: (val: unknown) => unknown;
    neq: (val: unknown) => unknown;
    eq: (val: unknown) => unknown;
    gte: (val: unknown) => unknown;
    lte: (val: unknown) => unknown;
    desc: () => unknown;
  }
>;

type LowStockItem = {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string | null;
  price: number;
  stock: number;
  status: "out_of_stock" | "low_stock";
};

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    // Fetch active non-deleted orders
    const allOrders = await db.orm.public.Order
      .where((o: QueryFieldAccessor) => o.isDeleted.ne(true))
      .include("user", (u: { select: (...args: string[]) => unknown }) => u.select("id", "name", "phone"))
      .include("items", (i: { all: () => unknown }) => i.all())
      .orderBy((o: QueryFieldAccessor) => o.createdAt.desc())
      .all();

    // Sales & Order Metrics
    let totalSales = 0;
    let todaySales = 0;
    let thisMonthSales = 0;
    let deliveredCount = 0;

    let ordersToday = 0;
    let ordersThisMonth = 0;

    const orderStatusCounts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };

    for (const order of allOrders) {
      const oDate = new Date(order.createdAt);
      const isToday = oDate >= startOfToday;
      const isThisMonth = oDate >= startOfMonth;

      if (isToday) ordersToday++;
      if (isThisMonth) ordersThisMonth++;

      const st = String(order.orderStatus || "PENDING").toLowerCase();
      if (st in orderStatusCounts) {
        orderStatusCounts[st]++;
      }

      if (order.orderStatus === "DELIVERED") {
        const amt = Number(order.total) || 0;
        totalSales += amt;
        deliveredCount++;
        if (isToday) todaySales += amt;
        if (isThisMonth) thisMonthSales += amt;
      }
    }

    const averageOrderValue = deliveredCount > 0 ? Math.round(totalSales / deliveredCount) : 0;

    // Fetch Products & Inventory
    const allProducts = await db.orm.public.Product
      .where({ isDelete: false })
      .all();

    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockItems: LowStockItem[] = [];

    for (const p of allProducts) {
      const s = Number(p.stock) || 0;
      const threshold = Number(p.lowStockAlert) || 5;

      if (s <= 0) {
        outOfStockCount++;
        if (lowStockItems.length < 6) {
          lowStockItems.push({
            id: p.id,
            name: p.name,
            slug: p.slug,
            thumbnail: p.thumbnail,
            price: Number(p.price) || 0,
            stock: s,
            status: "out_of_stock",
          });
        }
      } else if (s <= threshold) {
        lowStockCount++;
        if (lowStockItems.length < 6) {
          lowStockItems.push({
            id: p.id,
            name: p.name,
            slug: p.slug,
            thumbnail: p.thumbnail,
            price: Number(p.price) || 0,
            stock: s,
            status: "low_stock",
          });
        }
      } else {
        inStockCount++;
      }
    }

    // Top Selling Products
    const topProducts = [...allProducts]
      .sort((a, b) => (Number(b.totalSold) || 0) - (Number(a.totalSold) || 0))
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        thumbnail: p.thumbnail,
        price: Number(p.price) || 0,
        costPrice: Number(p.costPrice) || 0,
        totalSold: Number(p.totalSold) || 0,
        stock: Number(p.stock) || 0,
      }));

    // Customers Count
    let totalCustomers = 0;
    let newCustomersThisMonth = 0;
    try {
      const users = await db.orm.public.User.all();
      for (const u of users) {
        if (u.role === "User" || !u.role) {
          totalCustomers++;
          if (new Date(u.createdAt) >= startOfMonth) {
            newCustomersThisMonth++;
          }
        }
      }
    } catch (uErr) {
      console.error("Fetch users error:", uErr);
    }

    // Expenses
    let totalExpenses = 0;
    let thisMonthExpenses = 0;
    try {
      const expenses = await db.orm.expenses.all();
      for (const exp of expenses) {
        const amt = Number(exp.amount) || 0;
        totalExpenses += amt;
        const eDate = new Date(exp.date || exp.createdAt);
        if (eDate >= startOfMonth) {
          thisMonthExpenses += amt;
        }
      }
    } catch (expErr) {
      console.error("Fetch expenses error:", expErr);
    }

    // Estimated profit this month
    const estimatedNetProfit = Math.round(thisMonthSales - thisMonthExpenses);

    // Recent 6 Orders
    const recentOrders = allOrders.slice(0, 6).map(formatOrderForUI);

    return NextResponse.json({
      success: true,
      data: {
        sales: {
          totalRevenue: Math.round(totalSales * 100) / 100,
          todayRevenue: Math.round(todaySales * 100) / 100,
          thisMonthRevenue: Math.round(thisMonthSales * 100) / 100,
          averageOrderValue,
        },
        orders: {
          total: allOrders.length,
          today: ordersToday,
          thisMonth: ordersThisMonth,
          ...orderStatusCounts,
        },
        inventory: {
          totalProducts: allProducts.length,
          inStock: inStockCount,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
          lowStockItems,
        },
        customers: {
          total: totalCustomers,
          newThisMonth: newCustomersThisMonth,
        },
        expenses: {
          total: Math.round(totalExpenses * 100) / 100,
          thisMonth: Math.round(thisMonthExpenses * 100) / 100,
        },
        profit: {
          estimatedNet: estimatedNetProfit,
        },
        topSellingProducts: topProducts,
        recentOrders,
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Dashboard analytics error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
