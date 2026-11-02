import { redirect } from "next/navigation";
import { headers } from "next/headers";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/src/services/users";
import { db } from "@/src/prisma/db";
import { isProduction, rootDomain } from "@/src/utils/constants";
import { LocalizedText } from "@/src/components/i18n";
import InvitationActions from "./_components/invitation-actions";
import GuestsList from "./_components/guests-list";

export default async function InvitationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }
  if (user.status !== "owner" || !user.subdomain || !rootDomain) {
    redirect("/");
  }

  const host = (await headers()).get("host");
  const url = new URL(
    `${isProduction ? "https" : "http"}://${user.subdomain}.${rootDomain}/auth`,
  );
  if (!isProduction && host) {
    url.port = new URL(`http://${host}`).port;
  }

  const guests = await db.orm.public.User.where({
    ownerId: user.id,
    status: "guest",
  })
    .orderBy((guest) => guest.createdAt.desc())
    .select("id", "username", "createdAt")
    .all();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <LocalizedText message="invitations" />
        </h1>
        <p className="mt-1 text-muted-foreground">
          <LocalizedText message="invitationPageDescription" />
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <LocalizedText message="wishlistLink" />
          </CardTitle>
          <CardDescription>
            <LocalizedText message="wishlistLinkDescription" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvitationActions wishlistUrl={url.toString()} />
        </CardContent>
      </Card>

      <GuestsList
        guests={guests.map((guest) => ({
          id: guest.id,
          username: guest.username,
          createdAt: String(guest.createdAt),
        }))}
      />
    </div>
  );
}
