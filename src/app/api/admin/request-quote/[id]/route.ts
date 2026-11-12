import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.orm.public.RequestQuote.first({ id });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Request quote not found",
        },
        { status: 404 }
      );
    }

    await db.orm.public.RequestQuote.where({ id }).delete();

    return NextResponse.json({
      success: true,
      message: "Request quote deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
