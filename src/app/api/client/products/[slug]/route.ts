import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET Product by SLUG
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await db.orm.public.Product
      .where({ slug })
      .include("category", (c: any) => c.select("id", "name", "slug"))
      .include("brand", (b: any) => b.select("id", "name", "slug"))
      .include("variations", (v: any) => v.all())
      .first();

    if (!product) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json({ data: formatMongoCompat(product) });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}
