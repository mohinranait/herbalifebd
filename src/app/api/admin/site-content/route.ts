import { db } from "@/prisma/db";
import { NextResponse } from "next/server";

// GET Site Content
export async function GET() {
  try {
    let content = await db.orm.public.SiteContent.first();

    if (!content) {
      content = await db.orm.public.SiteContent.create({
        whyChooseUs: {
          title: "Why choose Us",
        },
        companyIntroduction: {
          title: "About company",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Site content fetched successfully",
      data: content,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch site content",
      },
      { status: 500 }
    );
  }
}

// CREATE OR UPDATE Site Content
export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    let content = await db.orm.public.SiteContent.first();

    if (content) {
      await db.orm.public.SiteContent.where({ id: content.id }).update({
        companyIntroduction: body.companyIntroduction !== undefined ? body.companyIntroduction : content.companyIntroduction,
        whyChooseUs: body.whyChooseUs !== undefined ? body.whyChooseUs : content.whyChooseUs,
      });
      content = await db.orm.public.SiteContent.first({ id: content.id });
    } else {
      content = await db.orm.public.SiteContent.create({
        companyIntroduction: body.companyIntroduction,
        whyChooseUs: body.whyChooseUs,
      });
    }

    return NextResponse.json({
      success: true,
      message: content
        ? "Site content saved successfully"
        : "Operation completed",
      data: content,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to save site content",
      },
      { status: 500 }
    );
  }
}
