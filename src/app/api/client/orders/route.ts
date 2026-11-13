import { AuthUser, getAuthUser } from "@/lib/authUser";
import { db } from "@/prisma/db";
import { formatOrderForUI } from "@/lib/order-utils";
import { IOrder } from "@/redux/service/orders/type";
import { IMetaPagination } from "@/types/common.type";
import { NextResponse } from "next/server";

type PrismaIncludeQuery = {
  select: (...fields: string[]) => unknown;
  all: () => unknown;
};

type OrderSortExpr = {
  createdAt: {
    desc: () => unknown;
    asc: () => unknown;
  };
};

export interface IClientOrderListResponse {
  success: boolean;
  data: IOrder[];
  meta: IMetaPagination;
}

export async function GET(req: Request) {
  try {
    const decoded = (await getAuthUser()) as AuthUser;

    const userId = decoded?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
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

    const totalOrders: number = await query.count();

    const orders = (await query
      .include("user", (u: PrismaIncludeQuery) => u.select("id", "name", "phone"))
      .include("items", (i: PrismaIncludeQuery) => i.all())
      .orderBy((o: OrderSortExpr) => o.createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all()) as unknown[];

    const formattedOrders = orders.map((order) =>
      formatOrderForUI(order as Record<string, unknown>)
    );

    const response: IClientOrderListResponse = {
      success: true,
      data: formattedOrders as IOrder[],
      meta: {
        total: totalOrders,
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit) || 1,
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
