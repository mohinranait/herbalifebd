import { getAuthUser } from "@/lib/authUser";
import { db } from "@/prisma/db";
import { formatOrderForUI } from "@/lib/order-utils";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const decoded = (await getAuthUser()) as { id: string; phone: string };

    const userId = decoded?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const isDelete = searchParams.get("isDelete");

    const skip = (page - 1) * limit;

    let query = db.orm.public.Order.where({ userId });

    if (isDelete === "true") {
      query = query.where({ isDeleted: true });
    } else if (isDelete === "false") {
      query = query.where({ isDeleted: false });
    } else {
      query = query.where({ isDeleted: false });
    }

    const orders = await query
      .include("user", (u: any) => u.select("id", "name", "phone"))
      .include("items", (i: any) => i.all())
      .orderBy((o: any) => o.createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();

    const formattedOrders = orders.map(formatOrderForUI);
    const totalOrders = orders.length;

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      meta: {
        total: totalOrders,
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit) || 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
