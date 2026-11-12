import { appSettingsSchema } from "@/components/validations/app-setting";
import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch Settings
export async function GET() {
  try {
    let settings = await db.orm.public.AppSetting.first();

    if (!settings) {
      settings = await db.orm.public.AppSetting.create({
        siteName: "My Ecommerce",
        contactEmail: "admin@yourstore.com",
      });
    }

    return NextResponse.json(formatMongoCompat(settings));
  } catch (error: any) {
    console.error("Fetch settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH - Update Settings
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = appSettingsSchema.parse(body);

    let existing = await db.orm.public.AppSetting.first();
    let updated;

    if (existing) {
      await db.orm.public.AppSetting.where({ id: existing.id }).update({
        ...validatedData,
      });
      updated = await db.orm.public.AppSetting.first({ id: existing.id });
    } else {
      updated = await db.orm.public.AppSetting.create({
        ...validatedData,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: formatMongoCompat(updated),
    });
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      {
        error: error.errors || error.message,
      },
      { status: 400 }
    );
  }
}
