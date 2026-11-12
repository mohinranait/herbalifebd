import { attributeSchema } from "@/components/validations/attributes";
import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
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

    let collection = db.orm.public.Attribute;

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
      collection = collection.where((a: any) => a.name.ilike(`%${search}%`));
    }

    const total = await collection.count();

    const attributes = await collection
      .orderBy((a: any) => a.createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();


    return NextResponse.json({
      success: true,
      data: formatMongoCompat(attributes),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching attributes:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Error fetching attributes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = attributeSchema.safeParse(body);
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

    const isExists = await db.orm.public.Attribute.where({ name: parsed.data.name }).first();
    if (isExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Name already exists",
        },
        { status: 409 }
      );
    }

    const attribute = await db.orm.public.Attribute.create({
      name: body.name,
      displayName: body.displayName || null,
      description: body.description || null,
      values: Array.isArray(body.values) ? body.values : [],
      status: body.status !== undefined ? Boolean(body.status) : true,
      priority: body.priority ? parseInt(body.priority) : 0,
      isDelete: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Attribute created successfully",
        data: formatMongoCompat(attribute),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Attribute API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
