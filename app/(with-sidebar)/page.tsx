import { redirect } from "next/navigation";

export default async function RootPage() {
  //const isLoggedIn = await checkAuth(); // e.g., check cookie/session
  const isLoggedIn = true;

  if (!isLoggedIn) {
    redirect("/login");
  }
  redirect("/home");
}
