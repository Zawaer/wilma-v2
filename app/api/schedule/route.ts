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

  const schedule = await session.getSchedule();

  if (!schedule) {
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }

  return NextResponse.json(schedule);
}
