import { cache } from "react";
import { cookies, headers } from "next/headers";
import { createHash } from "node:crypto";
import { db } from "../prisma/db";
import { rootDomain } from "../utils/constants";
import { getSubdomainFromHost } from "../utils/domain";

export const getCurrentUser = cache(async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const session = await db.orm.public.Session.whereUnique({
    tokenHash,
  }).first();

  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  const user = await db.orm.public.User.whereUnique({
    id: session.userId,
  }).first();

  if (!user || !rootDomain) {
    return null;
  }

  const host = (await headers()).get("host");
  const subdomain = getSubdomainFromHost(host, rootDomain);

  if (!subdomain) {
    return user.status === "owner" ? user : null;
  }

  const owner = await db.orm.public.User.whereUnique({ subdomain }).first();
  if (
    !owner ||
    owner.status !== "owner" ||
    (user.id !== owner.id && user.ownerId !== owner.id)
  ) {
    return null;
  }

  return user;
});
