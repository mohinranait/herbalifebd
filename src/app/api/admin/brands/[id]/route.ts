import { brandSchema } from "@/components/validations/brands";
import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { id } = await params;

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

    const existingBrand = await db.orm.public.Brand.first({ id });
    if (!existingBrand) {
      return NextResponse.json(
        {
          success: false,
          message: "Brand not found",
        },
        { status: 404 }
      );
    }

    if (slug && slug !== existingBrand.slug) {
      const duplicate = await db.orm.public.Brand
        .where({ slug })
        .where((b: any) => b.id.neq(id))
        .first();

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Slug already exists",
          },
          { status: 409 }
        );
      }
    }

    await db.orm.public.Brand.where({ id }).update({
      name: body.name !== undefined ? body.name : existingBrand.name,
      slug: body.slug !== undefined ? body.slug : existingBrand.slug,
      description: body.description !== undefined ? body.description : existingBrand.description,
      logo: body.logo !== undefined ? body.logo : existingBrand.logo,
      banner: body.banner !== undefined ? body.banner : existingBrand.banner,
      status: body.status !== undefined ? Boolean(body.status) : existingBrand.status,
      priority: body.priority !== undefined ? parseInt(body.priority) : existingBrand.priority,
      isDelete: body.isDelete !== undefined ? Boolean(body.isDelete) : existingBrand.isDelete,
    });

    const updated = await db.orm.public.Brand.first({ id });

    return NextResponse.json(
      {
        success: true,
        message: "Brand updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update Brand Error:", error);
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

    const brand = await db.orm.public.Brand.first({ id });
    if (!brand) {
      return NextResponse.json(
        {
          success: false,
          message: "Brand not found",
        },
        { status: 404 }
      );
    }

    await db.orm.public.Brand.where({ id }).delete();

    return NextResponse.json(
      {
        success: true,
        message: "Brand deleted successfully",
        data: brand,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete Brand Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
