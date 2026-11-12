import { getAuthUser } from "@/lib/authUser";
import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);

    const productId = id;
    const userId = searchParams.get("userId") || null;
    const accessMode = searchParams.get("accessMode") || "public";

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    let collection = db.orm.public.Comment.where({ productId });

    if (accessMode === "auth" && userId) {
      collection = collection.where({ userId });
    } else if (accessMode === "admin") {
      // Admin sees all
    } else {
      collection = collection.where({ isApproved: true });
    }

    const comments = await collection
      .include("user", (u: any) => u.select("id", "name"))
      .orderBy((c: any) => c.createdAt.desc())
      .all();

    const formatted = comments.map((c: any) => ({
      ...c,
      userId: c.user ? formatMongoCompat(c.user) : c.userId,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Successfully",
        data: formatMongoCompat(formatted),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch comments",
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

    const authUser = (await getAuthUser()) as {
      id: string;
      phone: string;
      role: string;
    };

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const existComment = await db.orm.public.Comment.first({ id });
    if (!existComment) {
      return NextResponse.json(
        { success: false, message: "Comment not found" },
        { status: 404 }
      );
    }

    if (
      authUser.role?.toLowerCase() !== "admin" &&
      authUser.role?.toLowerCase() !== "manager" &&
      authUser.id !== existComment.userId
    ) {
      return NextResponse.json(
        { success: false, message: "Can't update comments without permission" },
        { status: 403 }
      );
    }

    await db.orm.public.Comment.where({ id }).update({
      comment: body.comment !== undefined ? body.comment : existComment.comment,
      rating: body.rating !== undefined ? parseInt(body.rating) : existComment.rating,
      isApproved: body.isApproved !== undefined ? Boolean(body.isApproved) : existComment.isApproved,
      isFeature: body.isFeature !== undefined ? Boolean(body.isFeature) : existComment.isFeature,
    });

    const updated = await db.orm.public.Comment.first({ id });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully",
        data: formatMongoCompat(updated),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update comment Error:", error);
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

    const comment = await db.orm.public.Comment.first({ id });
    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          message: "Comment not found",
        },
        { status: 404 }
      );
    }

    await db.orm.public.Comment.where({ id }).delete();

    return NextResponse.json(
      {
        success: true,
        message: "comment deleted successfully",
        data: formatMongoCompat(comment),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete comment Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
