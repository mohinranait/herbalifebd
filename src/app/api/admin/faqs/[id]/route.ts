import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required", error: "Invalid FAQ ID" },
        { status: 400 }
      );
    }

    const faq = await db.orm.public.Faq.first({ id });

    if (!faq) {
      return NextResponse.json(
        { success: false, message: "FAQ not found", error: "FAQ not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: faq },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message, error: error?.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required", error: "Invalid FAQ ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const existing = await db.orm.public.Faq.first({ id });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "FAQ Not found", error: "FAQ not found" },
        { status: 404 }
      );
    }

    await db.orm.public.Faq.where({ id }).update({
      title: body.title !== undefined ? body.title : existing.title,
      contents: Array.isArray(body.contents) ? body.contents : existing.contents,
      priority: body.priority !== undefined ? parseInt(body.priority) : existing.priority,
      status: body.status !== undefined ? Boolean(body.status) : existing.status,
    });

    const updated = await db.orm.public.Faq.first({ id });

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Id is required", error: "Invalid FAQ ID" },
        { status: 400 }
      );
    }

    const faq = await db.orm.public.Faq.first({ id });
    if (!faq) {
      return NextResponse.json(
        { success: false, message: "FAQ not found" },
        { status: 404 }
      );
    }

    await db.orm.public.Faq.where({ id }).delete();

    return NextResponse.json(
      { success: true, message: "FAQ deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
