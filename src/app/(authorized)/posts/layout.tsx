import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/src/services/users";

export default async function PostsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  if (user.status !== "owner") {
    redirect("/");
  }

  return children;
}
