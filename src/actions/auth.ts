"use server";

import { cookies } from "next/headers";
import { db } from "../prisma/db";
import { createHash, randomBytes } from "node:crypto";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export async function createOrAuthenticateUser(username: string) {
  const normalizedUsername = username.trim().normalize("NFC").toLowerCase();

  if (!/^[a-z0-9_ąčęėįšųūž-]{3,24}$/.test(normalizedUsername)) {
    throw new Error("Username must be 3–24 characters.");
  }

  // Generate a token that is returned to the browser only once.
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const result = await db.transaction(async (tx) => {
    const user = await tx.orm.public.User.upsert({
      create: {
        username: normalizedUsername,
        status: "guest",
      },

      update: {
        username: normalizedUsername,
      },
      conflictOn: {
        username: normalizedUsername,
      },
    });

    const session = await tx.orm.public.Session.create({
      tokenHash,
      userId: user.id,
      expiresAt: expiresAt.toISOString(),
    });

    return { user, session };
  });

  return {
    user: result.user,
    token,
    expiresAt,
  };
}

export async function loginAction(username: string) {
  try {
    const { user, token, expiresAt } = await createOrAuthenticateUser(username);

    const cookieStore = await cookies();

    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return {
      success: true as const,
      user: {
        id: user.id,
        username: user.username,
        status: user.status,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Username must")) {
      return { success: false, error: error.message };
    }

    console.error("Login failed:", error);

    return {
      success: false,
      error: "Unable to sign in. Please try again.",
    };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (token) {
      const tokenHash = createHash("sha256").update(token).digest("hex");
      await db.orm.public.Session.where({ tokenHash }).delete();
    }

    cookieStore.delete("session");
    return { success: true as const };
  } catch (error) {
    console.error("Logout failed:", error);
    return {
      success: false as const,
      error: "Unable to sign out. Please try again.",
    };
  }
}
