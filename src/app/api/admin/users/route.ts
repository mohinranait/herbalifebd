import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const role = searchParams.get("role");

    const skip = (page - 1) * limit;

    let collection = db.orm.public.User;

    if (status) {
      collection = collection.where({ status });
    }
    if (role) {
      collection = collection.where({ role });
    }
    if (search) {
      collection = collection.where((u: any) => u.name.ilike(`%${search}%`));
    }

    const total = await collection.count();

    const users = await collection
      .orderBy((u: any) => u.createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();

    const sanitizedUsers = users.map((u: any) => {
      const { password: _, ...rest } = u;
      return rest;
    });


    return NextResponse.json({
      success: true,
      data: formatMongoCompat(sanitizedUsers),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Error fetching users" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, password, role, status } = body;

    if (!name || !phone || !password) {
      return NextResponse.json(
        { success: false, message: "Name, phone, and password are required" },
        { status: 400 }
      );
    }

    const existing = await db.orm.public.User.where({ phone }).first();
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Phone already exists" },
        { status: 409 }
      );
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = await db.orm.public.User.create({
      name,
      phone,
      password: hashedPassword,
      role: role || "User",
      status: status || "Active",
    });

    const { password: _, ...userWithoutPass } = user as any;

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: formatMongoCompat(userWithoutPass),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("User API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
