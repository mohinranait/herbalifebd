import { NextRequest, NextResponse } from "next/server";
import { getBrandsByCategory } from "@/lib/storefront-data";

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get("category");
    const data = await getBrandsByCategory(category || null);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Brands by category error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
