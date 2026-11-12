import { categorySchema } from "@/components/validations/categories";
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

    const total = await collection.count();

    const categories = await collection
      .orderBy((c: any) => c.createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();

    // totalProducts = products in the category itself plus all its sub-categories.
    // The category tree and the products are each loaded once for the whole page.
    const [tree, activeProducts] = await Promise.all([
      db.orm.public.Category.where({ isDelete: false, status: true }).select("id", "parentId").all(),
      db.orm.public.Product.where({ status: true, isDelete: false }).select("categoryId").all(),
    ]);

    const childrenOf = new Map<string, string[]>();
    for (const node of tree as any[]) {
      if (!node.parentId) continue;
      const parentId = String(node.parentId);
      childrenOf.set(parentId, [...(childrenOf.get(parentId) || []), String(node.id)]);
    }

    const directCount = new Map<string, number>();
    for (const product of activeProducts as any[]) {
      if (!product.categoryId) continue;
      const categoryId = String(product.categoryId);
      directCount.set(categoryId, (directCount.get(categoryId) || 0) + 1);
    }

    const countWithDescendants = (categoryId: string) => {
      let count = 0;
      const seen = new Set<string>();
      const queue = [categoryId];
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (seen.has(current)) continue; // guards against a parent/child loop
        seen.add(current);
        count += directCount.get(current) || 0;
        queue.push(...(childrenOf.get(current) || []));
      }
      return count;
    };

    const categoriesWithCount = categories.map((cat: any) => ({
      ...cat,
      totalProducts: countWithDescendants(String(cat.id)),
    }));

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
