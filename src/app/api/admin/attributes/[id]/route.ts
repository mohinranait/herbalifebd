import { attributeSchema } from "@/components/validations/attributes";
import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { id } = await params;

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

    const name = parsed.data.name;

    const existingAttr = await db.orm.public.Attribute.first({ id });
    if (!existingAttr) {
      return NextResponse.json(
        {
          success: false,
          message: "Attribute not found",
        },
        { status: 404 }
      );
    }

    if (name && name !== existingAttr.name) {
      const duplicate = await db.orm.public.Attribute
        .where({ name })
        .where((a: any) => a.id.neq(id))
        .first();

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Name already exists",
          },
          { status: 409 }
        );
      }
    }

    await db.orm.public.Attribute.where({ id }).update({
      name: body.name !== undefined ? body.name : existingAttr.name,
      displayName: body.displayName !== undefined ? body.displayName : existingAttr.displayName,
      description: body.description !== undefined ? body.description : existingAttr.description,
      values: Array.isArray(body.values) ? body.values : existingAttr.values,
      status: body.status !== undefined ? Boolean(body.status) : existingAttr.status,
      priority: body.priority !== undefined ? parseInt(body.priority) : existingAttr.priority,
      isDelete: body.isDelete !== undefined ? Boolean(body.isDelete) : existingAttr.isDelete,
    });

    const updated = await db.orm.public.Attribute.first({ id });

    return NextResponse.json(
      {
        success: true,
        message: "Attribute updated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update Attribute Error:", error);
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

    const attribute = await db.orm.public.Attribute.first({ id });
    if (!attribute) {
      return NextResponse.json(
        {
          success: false,
          message: "Attribute not found",
        },
        { status: 404 }
      );
    }

    await db.orm.public.Attribute.where({ id }).delete();

    return NextResponse.json(
      {
        success: true,
        message: "Attribute deleted successfully",
        data: attribute,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete Attribute Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
