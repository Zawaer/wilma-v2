import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // delete the cookies you set during login
  cookieStore.delete("Wilma2SID");

  return NextResponse.json({ success: true });
}
