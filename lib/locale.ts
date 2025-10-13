import { cookies } from "next/headers";

export async function getLocaleFromCookies() {
  // try to get the cookie and fallback to english if it fails
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "en";
  return locale;
}
