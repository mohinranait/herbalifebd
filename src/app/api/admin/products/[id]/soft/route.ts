import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = await db.orm.public.Product.first({ id });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const newDeleteStatus = !product.isDelete;
    await db.orm.public.Product.where({ id }).update({
      isDelete: newDeleteStatus,
    });

    const updated = await db.orm.public.Product.first({ id });

    return NextResponse.json(
      {
        success: true,
        message: newDeleteStatus ? "Moved to trash" : "Restored successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Soft Delete Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
