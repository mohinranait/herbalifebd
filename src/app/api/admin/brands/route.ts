import { brandSchema } from "@/components/validations/brands";
import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const isDelete = searchParams.get("isDelete");

    const skip = (page - 1) * limit;

    let collection = db.orm.public.Brand;

    if (status === "true") {
      collection = collection.where({ status: true });
    } else if (status === "false") {
      collection = collection.where({ status: false });
    }

    if (isDelete === "true") {
      collection = collection.where({ isDelete: true });
    } else if (isDelete === "false") {
      collection = collection.where({ isDelete: false });
    }

    if (search) {
      collection = collection.where((b: any) => b.name.ilike(`%${search}%`));
    }

    const total = await collection.count();

    const brands = await collection
      .orderBy((b: any) => b.createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();


    return NextResponse.json({
      success: true,
      message: "Success",
      data: brands,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Error fetching brands" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = brandSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { slug } = parsed.data;

    const existing = await db.orm.public.Brand.where({ slug }).first();
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug already exists",
        },
        { status: 409 }
      );
    }

    const brand = await db.orm.public.Brand.create({
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      logo: body.logo || null,
      banner: body.banner || null,
      status: body.status !== undefined ? Boolean(body.status) : true,
      priority: body.priority ? parseInt(body.priority) : 0,
      isDelete: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Brand created successfully",
        data: brand,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Brand API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
