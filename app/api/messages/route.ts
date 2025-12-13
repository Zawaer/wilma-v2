import { NextResponse } from "next/server";
import { getWilmaSession } from "@/lib/session";

export async function GET() {
  const session = await getWilmaSession();

  if (!session) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const messages = await session.getMessages();

  return NextResponse.json({ messages });
}
