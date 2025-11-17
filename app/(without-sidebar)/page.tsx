import { redirect } from "next/navigation";

export default async function RootPage() {
  // redirect to home page, middleware.ts checks authentication
  redirect("/home");
}
