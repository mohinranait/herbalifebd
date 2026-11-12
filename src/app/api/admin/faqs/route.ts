import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    let collection = db.orm.public.Faq;

    if (status === "true") {
      collection = collection.where({ status: true });
    } else if (status === "false") {
      collection = collection.where({ status: false });
    }

    if (search) {
      collection = collection.where((f: any) => f.title.ilike(`%${search}%`));
    }

    const faqs = await collection
      .orderBy([(f: any) => f.priority.asc(), (f: any) => f.createdAt.desc()])
      .offset(skip)
      .limit(limit)
      .all();

    return NextResponse.json(
      { success: true, data: formatMongoCompat(faqs) },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fetch FAQs error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "An unknown error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, contents, priority, status } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    const faq = await db.orm.public.Faq.create({
      title,
      contents: Array.isArray(contents) ? contents : [],
      priority: priority ? parseInt(priority) : 10,
      status: status !== undefined ? Boolean(status) : true,
    });

    return NextResponse.json(
      { success: true, data: formatMongoCompat(faq) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create FAQ error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "An unknown error occurred" },
      { status: 500 }
    );
  }
}
