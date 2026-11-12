import { getAllDescendantIds } from "@/lib/category-utils";
import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") || "latest";
    const skip = (page - 1) * limit;

    let collection = db.orm.public.Product
      .where({ status: true, isDelete: false });

    if (search) {
      collection = collection.where((p: any) => p.name.ilike(`%${search}%`));
    }

    let productsQuery = collection
      .include("category", (c: any) => c.select("id", "name", "slug"))
      .include("brand", (b: any) => b.select("id", "name", "slug"))
      .include("variations", (v: any) => v.all());

    switch (type.toLowerCase()) {
      case "featured":
        productsQuery = productsQuery
          .where({ isFeatured: true })
          .orderBy((p: any) => p.createdAt.desc());
        break;

      case "toprated":
        productsQuery = productsQuery.orderBy([
          (p: any) => p.ratingsAverage.desc(),
          (p: any) => p.createdAt.desc(),
        ]);
        break;

      case "bestselling":
        productsQuery = productsQuery.orderBy([
          (p: any) => p.totalSold.desc(),
          (p: any) => p.createdAt.desc(),
        ]);
        break;

      case "freeshipping":
        productsQuery = productsQuery
          .where({ isFreeShipping: true })
          .orderBy((p: any) => p.createdAt.desc());
        break;

      case "related":
        if (category) {
          const categoryIds = await getAllDescendantIds(category);
          if (categoryIds.length > 0) {
            productsQuery = productsQuery.where((p: any) =>
              p.categoryId.in(categoryIds)
            );
          }
        }
        productsQuery = productsQuery.orderBy((p: any) => p.createdAt.desc());
        break;

      case "offer":
      case "discount":
        productsQuery = productsQuery
          .where((p: any) => p.discountPrice.gt(0))
          .orderBy((p: any) => p.createdAt.desc());
        break;

      case "latest":
      case "new":
      default:
        productsQuery = productsQuery.orderBy((p: any) => p.createdAt.desc());
        break;
    }

    const products = await productsQuery.offset(skip).limit(limit).all();
    const total = products.length;

    return NextResponse.json({
      success: true,
      data: formatMongoCompat(products),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("Client product GET error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
