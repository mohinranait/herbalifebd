import { NextResponse } from "next/server";

// Logout user
export async function DELETE() {
  try {
    const response = NextResponse.json(
      { message: "User logout", success: true },
      { status: 200 }
    );

    // Clear the access_token cookie
    response.cookies.delete("access_token");
    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Logout failed", success: false },
      { status: 500 }
    );
  }
}