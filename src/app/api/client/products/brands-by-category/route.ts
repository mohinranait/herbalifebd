import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { getAllDescendantIds } from "@/lib/category-utils";

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get("category");

    let productsQuery = db.orm.public.Product
      .where({ isDelete: false, status: true })
      .where((p: any) => p.brandId.isNotNull());

    if (category) {
      const categoryIds = await getAllDescendantIds(category);
      if (categoryIds.length > 0) {
        productsQuery = productsQuery.where((p: any) => p.categoryId.in(categoryIds));
      }
    }

    const products = await productsQuery
      .select("brandId")
      .include("brand", (b: any) => b.select("id", "name", "logo", "status", "isDelete"))
      .all();

    const brandMap = new Map<string, any>();
    for (const p of products) {
      if (p.brand && (p.brand as any).status && !(p.brand as any).isDelete) {
        brandMap.set(p.brand.id, {
          _id: p.brand.id,
          id: p.brand.id,
          name: p.brand.name,
          logo: (p.brand as any).logo,
        });
      }
    }

    const brands = Array.from(brandMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return NextResponse.json({ success: true, data: formatMongoCompat(brands) });
  } catch (error: any) {
    console.error("Brands by category error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
