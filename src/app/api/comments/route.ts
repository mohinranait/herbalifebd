import { getAuthUser } from "@/lib/authUser";
import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// get all comments
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const isFeature = searchParams.get("isFeature");
    const status = searchParams.get("isApproved");
    const star = searchParams.get("rating");
    const productId = searchParams.get("productId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let collection = db.orm.public.Comment;

    if (status !== null && status !== undefined) {
      collection = collection.where({ isApproved: status === "true" });
    }
    if (isFeature !== null && isFeature !== undefined) {
      collection = collection.where({ isFeature: isFeature === "true" });
    }
    if (star) {
      collection = collection.where({ rating: parseInt(star) });
    }
    if (productId) {
      collection = collection.where({ productId });
    }
    if (search) {
      collection = collection.where((c: any) => c.comment.ilike(`%${search}%`));
    }

    const comments = await collection
      .include("product", (p: any) => p.select("id", "name"))
      .include("user", (u: any) => u.select("id", "name"))
      .orderBy((c: any) => c.createdAt.desc())
      .offset((page - 1) * limit)
      .limit(limit)
      .all();

    const formattedComments = comments.map((c: any) => ({
      ...c,
      productId: c.product ? formatMongoCompat(c.product) : c.productId,
      userId: c.user ? formatMongoCompat(c.user) : c.userId,
    }));

    const total = comments.length;

    return NextResponse.json({
      data: formatMongoCompat(formattedComments),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authUser = (await getAuthUser()) as { id: string; phone: string };

    const userId = authUser?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    const { productId, comment, rating } = body;
    if (!productId || !comment) {
      return NextResponse.json(
        { success: false, message: "Product ID and comment are required" },
        { status: 400 }
      );
    }

    const savedComment = await db.orm.public.Comment.create({
      productId,
      userId: authUser.id,
      comment,
      rating: rating ? parseInt(rating) : 5,
      isApproved: true,
      isFeature: false,
    });

    // Update product ratings
    const product = await db.orm.public.Product.first({ id: productId });
    if (product) {
      const oldTotal = product.totalReviews || 0;
      const oldAverage = product.ratingsAverage || 0;
      const numRating = rating ? parseInt(rating) : 5;

      const newTotal = oldTotal + 1;
      const newAverage = Number(
        ((oldAverage * oldTotal + numRating) / newTotal).toFixed(1)
      );

      await db.orm.public.Product.where({ id: productId }).update({
        totalReviews: newTotal,
        ratingsAverage: newAverage,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully",
        data: formatMongoCompat(savedComment),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Comment API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
