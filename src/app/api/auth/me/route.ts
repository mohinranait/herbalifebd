import { getAuthUser } from "@/lib/authUser";
import { db } from "@/prisma/db";
import { formatMongoCompat } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const decoded = await getAuthUser();
    let decodedUser: { id: string; phone: string };

    if (
      typeof decoded === "string" ||
      !decoded ||
      !("id" in decoded) ||
      !("phone" in decoded)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid token payload" },
        { status: 401 }
      );
    } else {
      decodedUser = { id: (decoded as any).id, phone: (decoded as any).phone };
    }

    const user = await db.orm.public.User.first({ id: decodedUser.id });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const { password: _, ...userWithoutPassword } = user as any;

    return NextResponse.json({
      success: true,
      message: "Authenticated user fetched",
      payload: formatMongoCompat(userWithoutPassword),
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 401 }
    );
  }
}
