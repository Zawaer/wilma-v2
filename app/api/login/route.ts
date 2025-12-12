import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { WilmaSession } from "@/lib/wilma-api";

export async function POST(req: NextRequest) {
  const { school, username, password } = await req.json();

  const wilma = new WilmaSession(school);
  const success = await wilma.login(username, password);

  if (!success) {
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 401 });
  }

  // store session ID and wilmaUrl securely
  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
  
  cookieStore.set("Wilma2SID", wilma.wilma2SID, cookieOptions);
  cookieStore.set("wilmaUrl", school, cookieOptions);

  return NextResponse.json({
    success: true,
    wilma2SID: wilma.wilma2SID,
    studentID: wilma.studentID,
    username: wilma.userName,
  });
}
