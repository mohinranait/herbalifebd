import { contactFormSchema } from "@/components/validations/contact";
import { getAuthUser } from "@/lib/authUser";
import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = contactFormSchema.safeParse(body);
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

    const contact = await db.orm.public.Contact.create({
      fullName: body.fullName || null,
      email: body.email || null,
      phone: body.phone || null,
      orderNumber: body.orderNumber || null,
      subject: body.subject || null,
      message: body.message || null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully",
        data: formatMongoCompat(contact),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = (await getAuthUser()) as {
      id: string;
      phone: string;
      role: string;
    };

    const userId = authUser?.id;
    if (!userId || authUser.role !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let collection = db.orm.public.Contact;

    if (search) {
      collection = collection.where((c: any) => c.fullName.ilike(`%${search}%`));
    }

    const total = await collection.count();

    const contacts = await collection
      .orderBy((c: any) => c.createdAt.desc())
      .offset((page - 1) * limit)
      .limit(limit)
      .all();


    return NextResponse.json({
      data: formatMongoCompat(contacts),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
