import { sliderSchema } from "@/components/validations/slider";
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

    let collection = db.orm.public.Slider;

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
      collection = collection.where((s: any) => s.title.ilike(`%${search}%`));
    }

    const total = await collection.count();

    const sliders = await collection
      .orderBy([(s: any) => s.order.asc(), (s: any) => s.createdAt.desc()])
      .offset(skip)
      .limit(limit)
      .all();


    return NextResponse.json({
      success: true,
      data: sliders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching sliders:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Error fetching sliders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = sliderSchema.safeParse(body);
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

    const slider = await db.orm.public.Slider.create({
      title: body.title,
      description: body.description || "",
      link: body.link || "",
      buttonName: body.buttonName || "Shop Now",
      sliderType: body.sliderType || "withoutImage",
      image: body.image || "",
      status: body.status !== undefined ? Boolean(body.status) : true,
      order: body.order ? parseInt(body.order) : 100,
      isDelete: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Slider created successfully",
        data: slider,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Slider API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
