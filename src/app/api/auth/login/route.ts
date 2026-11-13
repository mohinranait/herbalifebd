import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, NODE_ENV } from "@/lib/envSecret";
import { loginSchema } from "@/components/validations/auth.schema";
import { db } from "@/prisma/db";

const jwtSecret = JWT_SECRET as string;
const productionMode = NODE_ENV;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body || {};

    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const userDoc = await db.orm.public.User.where({ phone }).first();
    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (userDoc.status === "Banned") {
      return NextResponse.json(
        { success: false, error: "Your account has banned. Please contact Admin" },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, userDoc.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const { password: _, ...userWithoutPassword } = userDoc as any;
    const user = userWithoutPassword;

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      jwtSecret,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      statusCode: 200,
      payload: user,
    });

    response.cookies.set("access_token", token, {
      httpOnly: true,
      secure: productionMode === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
