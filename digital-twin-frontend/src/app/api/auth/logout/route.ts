import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Clear the auth cookies with the same attributes used when setting them
    const cookieStore = await cookies();
    cookieStore.delete({
      name: "auth_token",
      path: "/",
    });
    cookieStore.delete({
      name: "refresh_token",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
