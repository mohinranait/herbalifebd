import { getProductBySlug } from "@/lib/storefront-data";
import { NextResponse } from "next/server";

// GET Product by SLUG
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch product";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
