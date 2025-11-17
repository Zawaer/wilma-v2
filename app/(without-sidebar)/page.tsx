import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function RootPage() {
  // read cookies server-side
  const cookieStore = await cookies();
  const wilmaSID = cookieStore.get("Wilma2SID")?.value;

  if (!wilmaSID) {
    redirect("/login");
  }
  redirect("/home");
}
