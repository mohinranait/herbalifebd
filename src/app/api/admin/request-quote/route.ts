import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let collection = db.orm.public.RequestQuote;

    if (search) {
      collection = collection.where((rq: any) => rq.name.ilike(`%${search}%`));
    }

    const quotes = await collection
      .include("product", (p: any) => p.select("id", "name", "slug", "thumbnail"))
      .orderBy((rq: any) => rq.createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();

    const formatted = quotes.map((rq: any) => ({
      ...rq,
      productId: rq.product ? formatMongoCompat(rq.product) : rq.productId,
      location: {
        address: rq.address,
        zipCode: rq.zipCode,
        district: rq.district,
      },
      request: {
        name: rq.name,
        whatsappNumber: rq.whatsappNumber,
        phone: rq.phone,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formatMongoCompat(formatted),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "An unknown error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await db.orm.public.RequestQuote.create({
      productId: body.productId || null,
      address: body.location?.address || body.address || null,
      zipCode: body.location?.zipCode || body.zipCode || null,
      district: body.location?.district || body.district || null,
      name: body.request?.name || body.name || null,
      whatsappNumber: body.request?.whatsappNumber || body.whatsappNumber || null,
      phone: body.request?.phone || body.phone || null,
      quantity: body.quantity ? parseInt(body.quantity) : null,
      notes: body.notes || null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Request quote created successfully",
        data: formatMongoCompat(result),
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "An unknown error occurred" },
      { status: 500 }
    );
  }
}
