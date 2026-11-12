import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import os from "os";

import { v2 as cloudinary } from "cloudinary";
import { nanoid } from "nanoid";
import { applyCloudinaryConfig } from "@/lib/loudinary";
import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { getAuthUser } from "@/lib/authUser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Invalid filed", error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    const tempFilePath = path.join(os.tmpdir(), `${nanoid()}_${file.name}`);
    await writeFile(tempFilePath, buffer);

    await applyCloudinaryConfig();

    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: "celi-app",
    });

    const { format, width, height, bytes: iBytes, secure_url, public_id } = result;

    const newMedia = await db.orm.public.Media.create({
      fileUrl: secure_url,
      width,
      height,
      extension: format,
      size: iBytes,
      public_id,
      secure_url,
    });

    return NextResponse.json({
      success: true,
      payload: {
        file: formatMongoCompat(newMedia),
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}

// Get all images API
export async function GET(request: NextRequest) {
  try {
    await applyCloudinaryConfig();
    const decoded = (await getAuthUser()) as { id: string; phone: string };

    const userId = decoded?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const medias = await db.orm.public.Media
      .orderBy((m: any) => m.createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();

    const total = medias.length;

    return NextResponse.json({
      success: true,
      statusCode: 200,
      data: {
        medias: formatMongoCompat(medias),
      },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("GET /api/media error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await applyCloudinaryConfig();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
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
