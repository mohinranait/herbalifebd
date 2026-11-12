import { categorySchema } from "@/components/validations/categories";
import { getAllDescendantIds } from "@/lib/category-utils";
import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10000");
    const status = searchParams.get("status");
    const isDelete = searchParams.get("isDelete");

    const skip = (page - 1) * limit;

    let collection = db.orm.public.Category;

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
      collection = collection.where((c: any) =>
        c.name.ilike(`%${search}%`)
      );
    }

    const categories = await collection
      .orderBy((c: any) => c.createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();

    const total = categories.length; // Approximate for paginated or count if needed

    // Add totalProducts for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat: any) => {
        const descendantIds = await getAllDescendantIds(cat.id);
        const descendantSet = new Set(descendantIds);

        const allProducts = await db.orm.public.Product
          .where({ status: true, isDelete: false })
          .select("categoryId")
          .all();

        const totalProducts = allProducts.filter(
          (p: any) => p.categoryId && descendantSet.has(p.categoryId)
        ).length;

        return {
          ...cat,
          totalProducts,
        };
      })
    );

    return NextResponse.json({
      success: true,
      message: "Successfull",
      data: formatMongoCompat(categoriesWithCount),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Error fetching categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "All field are required",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { slug } = parsed.data;

    const existing = await db.orm.public.Category.where({ slug }).first();
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug already exists",
        },
        { status: 409 }
      );
    }

    let level = 0;
    let path: string[] = [];

    if (body.parentId) {
      const parent = await db.orm.public.Category.first({ id: body.parentId });
      if (!parent) {
        throw new Error("Parent category not found");
      }
      level = (parent.level || 0) + 1;
      path = [...(parent.path || []), parent.id];
    }

    const category = await db.orm.public.Category.create({
      name: body.name,
      slug: body.slug,
      parentId: body.parentId || null,
      thumbnail: body.thumbnail || null,
      banner: body.banner || null,
      description: body.description || null,
      level,
      path,
      status: body.status !== undefined ? Boolean(body.status) : true,
      priority: body.priority ? parseInt(body.priority) : 0,
      isDelete: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: formatMongoCompat(category),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Category API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
