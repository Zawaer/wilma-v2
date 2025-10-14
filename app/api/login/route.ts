import { NextRequest, NextResponse } from "next/server";
import { WilmaSession } from "@/lib/wilma_api";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const wilma = new WilmaSession("https://espoo.inschool.fi");
  const success = await wilma.login(username, password);

  if (!success) {
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    username: wilma.username,
    studentId: wilma.studentId,
    wilma2SID: wilma.wilma2SID,
    cookies: wilma.cookies
  });
}
