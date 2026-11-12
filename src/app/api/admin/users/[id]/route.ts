import { userSchema } from "@/components/validations/user.schema";
import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingUser = await db.orm.public.User.first({ id });
    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const { password: _, ...userWithoutPass } = existingUser as any;

    return NextResponse.json(
      {
        success: true,
        message: "Successfully",
        data: formatMongoCompat(userWithoutPass),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get User Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { id } = await params;

    const parsed = userSchema.safeParse(body);
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

    const { phone } = parsed.data;

    const existingUser = await db.orm.public.User.first({ id });
    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (phone && phone !== existingUser.phone) {
      const duplicate = await db.orm.public.User
        .where({ phone })
        .where((u: any) => u.id.neq(id))
        .first();

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Phone already exists",
          },
          { status: 409 }
        );
      }
    }

    let password = existingUser.password;
    if (body.password && body.password.trim()) {
      const salt = bcrypt.genSaltSync(10);
      password = bcrypt.hashSync(body.password, salt);
    }

    await db.orm.public.User.where({ id }).update({
      name: body.name !== undefined ? body.name : existingUser.name,
      phone: body.phone !== undefined ? body.phone : existingUser.phone,
      role: body.role !== undefined ? body.role : existingUser.role,
      status: body.status !== undefined ? body.status : existingUser.status,
      password,
    });

    const updatedUser = await db.orm.public.User.first({ id });
    const { password: _, ...userWithoutPass } = updatedUser as any;

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        data: formatMongoCompat(userWithoutPass),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update User Error:", error);
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

    const user = await db.orm.public.User.first({ id });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    await db.orm.public.User.where({ id }).delete();

    const { password: _, ...userWithoutPass } = user as any;

    return NextResponse.json(
      {
        success: true,
        message: "User deleted successfully",
        data: formatMongoCompat(userWithoutPass),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete User Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
