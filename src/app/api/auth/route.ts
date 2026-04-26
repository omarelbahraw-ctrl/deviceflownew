import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  let role = "EMPLOYEE";
  
  if (username === "omar" && password === "123456") {
    role = "ADMIN";
  } else if (username === "user" && password === "user") {
    role = "EMPLOYEE";
  } else {
    return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }

  // Set auth cookie
  const cookieStore = await cookies();
  cookieStore.set("deviceflow_session", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ success: true, role });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("deviceflow_session");
  return NextResponse.json({ success: true });
}
