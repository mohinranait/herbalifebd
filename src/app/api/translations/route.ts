import { db } from "@/prisma/db";
import { NextResponse } from "next/server";
import { DEFAULT_TRANSLATIONS } from "@/constants/default-translations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let record = await db.orm.public.SiteTranslation.first();

    if (!record) {
      record = await db.orm.public.SiteTranslation.create({
        content: DEFAULT_TRANSLATIONS,
      });
    }

    const content = (record?.content as Record<string, string>) || DEFAULT_TRANSLATIONS;

    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error: any) {
    console.error("Failed to fetch translations:", error);
    // Return default fallback in case of database error
    return NextResponse.json({
      success: true,
      data: DEFAULT_TRANSLATIONS,
    });
  }
}
