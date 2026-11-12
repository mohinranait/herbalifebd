import { db } from "@/prisma/db";
import { formatOrderForUI } from "@/lib/order-utils";
import { NextResponse } from "next/server";

// Get order by tracking Number
export async function GET(
  req: Request,
  { params }: { params: Promise<{ trackid: string }> }
) {
  try {
    const { trackid } = await params;

    const order = await db.orm.public.Order
      .where({ trackingNumber: trackid })
      .include("items", (i: any) => i.all())
      .include("user", (u: any) => u.select("id", "name", "phone"))
      .first();

    if (!order) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json({ data: formatOrderForUI(order) });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
