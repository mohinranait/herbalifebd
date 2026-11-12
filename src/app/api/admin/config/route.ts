import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch the configuration
export async function GET() {
  try {
    let config = await db.orm.public.AppConfig.first();

    if (!config) {
      config = await db.orm.public.AppConfig.create({
        email: { user: "", password: "", status: false },
        cloudinary: { name: "", key: "", secret: "", status: false },
      });
    }

    return NextResponse.json(
      { success: true, data: formatMongoCompat(config) },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}

// POST: Update the configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, data, status } = body;

    let config = await db.orm.public.AppConfig.first();

    const existingEmail = (config?.email as any) || {};
    const existingCloudinary = (config?.cloudinary as any) || {};

    const email =
      section === "email"
        ? {
            ...existingEmail,
            ...data,
            status: status !== undefined ? status : existingEmail.status,
          }
        : existingEmail;

    const cloudinary =
      section === "cloudinary"
        ? {
            ...existingCloudinary,
            ...data,
            status: status !== undefined ? status : existingCloudinary.status,
          }
        : existingCloudinary;

    if (!config) {
      config = await db.orm.public.AppConfig.create({
        email,
        cloudinary,
      });
    } else {
      await db.orm.public.AppConfig.where({ id: config.id }).update({
        email,
        cloudinary,
      });
      config = await db.orm.public.AppConfig.first({ id: config.id });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Configuration updated successfully",
        data: formatMongoCompat(config),
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update configuration" },
      { status: 500 }
    );
  }
}
