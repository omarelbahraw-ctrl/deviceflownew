import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "يرجى إدخال اسم المستخدم وكلمة المرور" }, { status: 400 });
  }

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || user.password !== password) {
    return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }

  // Set auth cookie with user ID and role
  const cookieStore = await cookies();
  cookieStore.set("deviceflow_session", JSON.stringify({ userId: user.id, role: user.role, name: user.name }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ success: true, role: user.role, name: user.name });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("deviceflow_session");
  return NextResponse.json({ success: true });
}
