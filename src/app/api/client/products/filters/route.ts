import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { getAllDescendantIds } from "@/lib/category-utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const brandParam = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minRating = searchParams.get("minRating");
    const sort = searchParams.get("sort") || "default";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const brands = brandParam
      ? brandParam.split(",").map((b) => b.trim()).filter(Boolean)
      : [];

    let query = db.orm.public.Product
      .where({ isDelete: false, status: true });

    if (category) {
      const categoryIds = await getAllDescendantIds(category);
      if (categoryIds.length > 0) {
        query = query.where((p: any) => p.categoryId.in(categoryIds));
      }
    }

    if (brands.length > 0) {
      query = query.where((p: any) => p.brandId.in(brands));
    }

    if (minPrice) {
      query = query.where((p: any) => p.price.gte(parseFloat(minPrice)));
    }
    if (maxPrice) {
      query = query.where((p: any) => p.price.lte(parseFloat(maxPrice)));
    }

    if (minRating) {
      query = query.where((p: any) => p.ratingsAverage.gte(parseFloat(minRating)));
    }

    if (search) {
      query = query.where((p: any) => p.name.ilike(`%${search}%`));
    }

    const total = await query.count();

    let orderedQuery = query
      .include("brand", (b: any) => b.select("id", "name", "logo"))
      .include("category", (c: any) => c.select("id", "name", "slug"))
      .include("variations", (v: any) => v.all());

    switch (sort) {
      case "price_asc":
        orderedQuery = orderedQuery.orderBy((p: any) => p.price.asc());
        break;
      case "price_desc":
        orderedQuery = orderedQuery.orderBy((p: any) => p.price.desc());
        break;
      case "rating":
        orderedQuery = orderedQuery.orderBy((p: any) => p.ratingsAverage.desc());
        break;
      case "newest":
        orderedQuery = orderedQuery.orderBy((p: any) => p.createdAt.desc());
        break;
      case "default":
      default:
        orderedQuery = orderedQuery.orderBy([
          (p: any) => p.isFeatured.desc(),
          (p: any) => p.createdAt.desc(),
        ]);
        break;
    }

    const skip = (page - 1) * limit;
    const products = await orderedQuery.offset(skip).limit(limit).all();

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
    console.error("Filter products error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to filter products" },
      { status: 500 }
    );
  }
}
