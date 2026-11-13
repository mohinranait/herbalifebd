import { NextRequest, NextResponse } from "next/server";
import { getProductFilters } from "@/lib/storefront-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const data = await getProductFilters({
      search: searchParams.get("search"),
      category: searchParams.get("category"),
      brand: searchParams.get("brand"),
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
      minRating: searchParams.get("minRating"),
      sort: searchParams.get("sort") || "default",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to filter products";
    console.error("Filter products error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
