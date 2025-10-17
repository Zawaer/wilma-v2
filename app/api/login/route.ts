import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { WilmaSession } from "@/lib/wilma_api";

export async function POST(req: NextRequest) {
  const { school, username, password } = await req.json();

  const wilma = new WilmaSession(school);
  const success = await wilma.login(username, password);

  if (!success) {
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 401 });
  }

  // store session ID securely
  const cookieStore = await cookies();
  cookieStore.set("Wilma2SID", wilma.wilma2SID, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return NextResponse.json({
    success: true,
    wilma2SID: wilma.wilma2SID,
    studentID: wilma.studentID,
    username: wilma.username,
  });
}
