import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const attribute = await db.orm.public.Attribute.first({ id });

    if (!attribute) {
      return NextResponse.json(
        {
          success: false,
          message: "Attribute not found",
        },
        { status: 404 }
      );
    }

    const newDeleteStatus = !attribute.isDelete;
    await db.orm.public.Attribute.where({ id }).update({
      isDelete: newDeleteStatus,
    });

    const updated = await db.orm.public.Attribute.first({ id });

    return NextResponse.json(
      {
        success: true,
        message: newDeleteStatus ? "Moved to trash" : "Restored successfully",
        data: formatMongoCompat(updated),
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
