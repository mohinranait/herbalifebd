import { sliderSchema } from "@/components/validations/slider";
import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { id } = await params;

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

    const existingSlider = await db.orm.public.Slider.first({ id });
    if (!existingSlider) {
      return NextResponse.json(
        {
          success: false,
          message: "Slider not found",
        },
        { status: 404 }
      );
    }

    await db.orm.public.Slider.where({ id }).update({
      title: body.title !== undefined ? body.title : existingSlider.title,
      description: body.description !== undefined ? body.description : existingSlider.description,
      link: body.link !== undefined ? body.link : existingSlider.link,
      buttonName: body.buttonName !== undefined ? body.buttonName : existingSlider.buttonName,
      sliderType: body.sliderType !== undefined ? body.sliderType : existingSlider.sliderType,
      image: body.image !== undefined ? body.image : existingSlider.image,
      status: body.status !== undefined ? Boolean(body.status) : existingSlider.status,
      order: body.order !== undefined ? parseInt(body.order) : existingSlider.order,
      isDelete: body.isDelete !== undefined ? Boolean(body.isDelete) : existingSlider.isDelete,
    });

    const updated = await db.orm.public.Slider.first({ id });

    return NextResponse.json(
      {
        success: true,
        message: "Slider updated successfully",
        data: formatMongoCompat(updated),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update Slider Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const slider = await db.orm.public.Slider.first({ id });
    if (!slider) {
      return NextResponse.json(
        {
          success: false,
          message: "Slider not found",
        },
        { status: 404 }
      );
    }

    await db.orm.public.Slider.where({ id }).delete();

    return NextResponse.json(
      {
        success: true,
        message: "Slider deleted successfully",
        data: formatMongoCompat(slider),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete Slider Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
