import { categorySchema } from "@/components/validations/categories";
import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { id } = await params;

    const parsed = categorySchema.partial().safeParse(body);
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

    const existingCategory = await db.orm.public.Category.first({ id });
    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    if (slug && slug !== existingCategory.slug) {
      const duplicate = await db.orm.public.Category
        .where({ slug })
        .where((c: any) => c.id.neq(id))
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

    await db.orm.public.Category.where({ id }).update({
      name: body.name !== undefined ? body.name : existingCategory.name,
      slug: body.slug !== undefined ? body.slug : existingCategory.slug,
      parentId: body.parentId !== undefined ? body.parentId || null : existingCategory.parentId,
      thumbnail: body.thumbnail !== undefined ? body.thumbnail : existingCategory.thumbnail,
      banner: body.banner !== undefined ? body.banner : existingCategory.banner,
      description: body.description !== undefined ? body.description : existingCategory.description,
      level: body.level !== undefined ? parseInt(body.level) : existingCategory.level,
      status: body.status !== undefined ? Boolean(body.status) : existingCategory.status,
      priority: body.priority !== undefined ? parseInt(body.priority) : existingCategory.priority,
      isDelete: body.isDelete !== undefined ? Boolean(body.isDelete) : existingCategory.isDelete,
    });

    const updatedCategory = await db.orm.public.Category.first({ id });

    return NextResponse.json(
      {
        success: true,
        message: "Category updated successfully",
        data: updatedCategory,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update Category Error:", error);
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

    const category = await db.orm.public.Category.first({ id });
    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    await db.orm.public.Category.where({ id }).delete();

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully",
        data: category,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete Category Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
