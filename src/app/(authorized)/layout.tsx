import React from "react";
import { redirect } from "next/navigation";
import AppNavigation from "@/src/components/app-navigation";
import { getCurrentUser } from "@/src/services/users";

type Props = {
  children: React.ReactNode;
};

const AuthorizedLayout = async ({ children }: Props) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <div className="app-background mx-auto min-h-screen w-full max-w-350 px-2 pb-8 sm:px-4">
      <AppNavigation isOwner={user.status === "owner"} />
      <main>{children}</main>
    </div>
  );
};

export default AuthorizedLayout;
