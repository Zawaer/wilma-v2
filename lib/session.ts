import { cookies } from "next/headers";
import { WilmaSession } from "./wilma-api";

/**
 * Get the current WilmaSession from cookies.
 * Returns null if the user is not authenticated.
 * 
 * This should be used in API routes to get the authenticated session.
 */
export async function getWilmaSession(): Promise<WilmaSession | null> {
  const cookieStore = await cookies();
  const wilmaUrl = cookieStore.get("wilmaUrl")?.value;
  const wilma2SID = cookieStore.get("Wilma2SID")?.value;

  if (!wilmaUrl || !wilma2SID) {
    return null;
  }

  const session = new WilmaSession(wilmaUrl);
  session.wilma2SID = wilma2SID;
  
  return session;
}
