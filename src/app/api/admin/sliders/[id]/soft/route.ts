import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const slider = await db.orm.public.Slider.first({ id });

    if (!slider) {
      return NextResponse.json(
        {
          success: false,
          message: "Slider not found",
        },
        { status: 404 }
      );
    }

    const newDeleteStatus = !slider.isDelete;
    await db.orm.public.Slider.where({ id }).update({
      isDelete: newDeleteStatus,
    });

    const updated = await db.orm.public.Slider.first({ id });

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
