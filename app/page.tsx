import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootPage() {
  const headerStore = await headers();
  const userId = headerStore.get("x-user-id");

  if (userId) {
    redirect("/dashboard");
  }

  redirect("/login");
}
