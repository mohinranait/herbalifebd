import { getProductList } from "@/lib/storefront-data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const data = await getProductList({
      category: searchParams.get("category"),
      search: searchParams.get("search") || "",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      type: searchParams.get("type") || "latest",
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Client product GET error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
