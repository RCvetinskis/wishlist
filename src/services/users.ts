import { cache } from "react";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { db } from "../prisma/db";

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

  return user;
});
