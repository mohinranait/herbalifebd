import { applyCloudinaryConfig } from "@/lib/loudinary";
import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await applyCloudinaryConfig();

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const media = await db.orm.public.Media.first({ id });
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    await db.orm.public.Media.where({ id }).delete();

    if (media?.public_id) {
      await cloudinary.uploader.destroy(media.public_id);
    }

    return NextResponse.json({
      message: "Media deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
