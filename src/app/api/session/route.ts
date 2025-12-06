import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SESSION_KEY = "hackaton_user_id";

export async function POST(request: NextRequest) {
  const { userId } = await request.json();

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_KEY, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_KEY);
  return NextResponse.json({ success: true });
}
