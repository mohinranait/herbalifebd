import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, password } = body;

    // validation
    if (!name || !phone || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Duplicate check
    const isExists = await db.orm.public.User.where({ phone }).first();
    if (isExists) {
      return NextResponse.json(
        { success: false, error: "This phone already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create user
    const newUser = await db.orm.public.User.create({
      name,
      phone,
      password: hashedPassword,
      // Public sign-up always creates a normal customer; admins are made from the admin panel
      role: "User",
      status: "Active",
    });

    const { password: _, ...user } = newUser as any;

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      data: formatMongoCompat(user),
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
