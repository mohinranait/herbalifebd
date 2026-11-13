import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const category = await db.orm.public.Category.first({ id });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    const newDeleteStatus = !category.isDelete;
    await db.orm.public.Category.where({ id }).update({
      isDelete: newDeleteStatus,
    });

    const updated = await db.orm.public.Category.first({ id });

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
