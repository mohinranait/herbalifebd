import { db } from "@/prisma/db";
import { NextResponse } from "next/server";
import { DEFAULT_TRANSLATIONS } from "@/constants/default-translations";

export const dynamic = "force-dynamic";

// GET translations for Admin
export async function GET() {
  try {
    let record = await db.orm.public.SiteTranslation.first();

    if (!record) {
      record = await db.orm.public.SiteTranslation.create({
        content: DEFAULT_TRANSLATIONS,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Translations fetched successfully",
      data: record.content || {},
      updatedAt: record.updatedAt,
      id: record.id,
    });
  } catch (error: any) {
    console.error("Admin fetch translations error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch translations",
      },
      { status: 500 }
    );
  }
}

// UPDATE translations
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "object") {
      return NextResponse.json(
        { success: false, message: "Valid content object is required" },
        { status: 400 }
      );
    }

    let record = await db.orm.public.SiteTranslation.first();

    if (record) {
      await db.orm.public.SiteTranslation.where({ id: record.id }).update({
        content,
      });
      record = await db.orm.public.SiteTranslation.first({ id: record.id });
    } else {
      record = await db.orm.public.SiteTranslation.create({
        content,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Translations updated successfully",
      data: record?.content || {},
    });
  } catch (error: any) {
    console.error("Admin update translations error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update translations",
      },
      { status: 500 }
    );
  }
}

// RESET to defaults
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === "reset") {
      let record = await db.orm.public.SiteTranslation.first();

      if (record) {
        await db.orm.public.SiteTranslation.where({ id: record.id }).update({
          content: DEFAULT_TRANSLATIONS,
        });
      } else {
        await db.orm.public.SiteTranslation.create({
          content: DEFAULT_TRANSLATIONS,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Translations reset to default successfully",
        data: DEFAULT_TRANSLATIONS,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Admin reset translations error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to reset translations",
      },
      { status: 500 }
    );
  }
}
