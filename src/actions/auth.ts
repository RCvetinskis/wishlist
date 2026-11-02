"use server";

import { cookies, headers } from "next/headers";
import { createHash, randomBytes } from "node:crypto";

import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/src/services/users";
import {
  isProduction,
  rootDomain,
  SESSION_DURATION_MS,
  usernameRegex,
} from "@/src/utils/constants";
import {
  getOwnerSubdomain,
  getSubdomainFromHost,
  RESERVED_OWNER_SUBDOMAINS,
} from "@/src/utils/domain";
import {
  hashPassword,
  isValidPassword,
  verifyPassword,
} from "@/src/utils/password";
const INVALID_CREDENTIALS =
  "Unable to sign in. Please check your credentials and try again.";
const INVALID_WISHLIST = "This wishlist is unavailable.";
const RESERVED_SUBDOMAIN =
  "That username cannot be used for a wishlist address.";
const USERNAME_UNAVAILABLE = "That username is unavailable.";

function normalizeUsername(username: string) {
  return username.trim().normalize("NFC").toLowerCase();
}

async function createSession(userId: number) {
  if (!rootDomain) {
    throw new Error(
      "ROOT_DOMAIN must be configured to enable user subdomains.",
    );
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.orm.public.Session.create({
    tokenHash,
    userId,
    expiresAt: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    domain: rootDomain,
    expires: expiresAt,
  });

  return expiresAt;
}

function getOwnerRedirectUrl(subdomain: string, host: string | null) {
  if (!rootDomain) {
    throw new Error(
      "ROOT_DOMAIN must be configured to enable user subdomains.",
    );
  }

  const protocol = isProduction ? "https" : "http";
  const url = new URL(`${protocol}://${subdomain}.${rootDomain}`);
  if (!isProduction && host) {
    url.port = new URL(`http://${host}`).port;
  }

  return url.toString();
}

export async function registerOwnerAction(username: string, password: string) {
  try {
    if (!rootDomain) {
      throw new Error(
        "ROOT_DOMAIN must be configured to enable user subdomains.",
      );
    }

    const requestHeaders = await headers();
    if (getSubdomainFromHost(requestHeaders.get("host"), rootDomain)) {
      return { success: false as const, error: INVALID_CREDENTIALS };
    }

    const normalizedUsername = normalizeUsername(username);
    if (!usernameRegex.test(normalizedUsername)) {
      return {
        success: false as const,
        error: "Username must be 3–24 characters.",
      };
    }
    if (RESERVED_OWNER_SUBDOMAINS.has(normalizedUsername)) {
      return { success: false as const, error: RESERVED_SUBDOMAIN };
    }
    if (!isValidPassword(password)) {
      return {
        success: false as const,
        error: "Password must be 12–128 characters.",
      };
    }

    const subdomain = getOwnerSubdomain(normalizedUsername, rootDomain);
    const existingOwner = await db.orm.public.User.whereUnique({
      subdomain,
    }).first();
    const existingLegacyOwner = await db.orm.public.User.where({
      username: normalizedUsername,
      status: "owner",
    }).first();
    if (existingOwner || existingLegacyOwner) {
      return { success: false as const, error: USERNAME_UNAVAILABLE };
    }

    const owner = await db.orm.public.User.create({
      username: normalizedUsername,
      subdomain,
      passwordHash: await hashPassword(password),
      status: "owner",
    });

    await createSession(owner.id);

    return {
      success: true as const,
      user: { id: owner.id, username: owner.username, status: owner.status },
      redirectUrl: getOwnerRedirectUrl(subdomain, requestHeaders.get("host")),
    };
  } catch (error) {
    console.error("Owner registration failed:", error);
    return {
      success: false as const,
      error: "Unable to create your account. Please try again.",
    };
  }
}

export async function loginOwnerAction(username: string, password: string) {
  try {
    if (!rootDomain) {
      throw new Error(
        "ROOT_DOMAIN must be configured to enable user subdomains.",
      );
    }

    const requestHeaders = await headers();
    if (getSubdomainFromHost(requestHeaders.get("host"), rootDomain)) {
      return { success: false as const, error: INVALID_CREDENTIALS };
    }

    const normalizedUsername = normalizeUsername(username);
    if (!usernameRegex.test(normalizedUsername)) {
      return { success: false as const, error: INVALID_CREDENTIALS };
    }
    if (!isValidPassword(password)) {
      return { success: false as const, error: INVALID_CREDENTIALS };
    }

    const subdomain = getOwnerSubdomain(normalizedUsername, rootDomain);
    const owner = await db.orm.public.User.whereUnique({ subdomain }).first();

    if (
      !owner ||
      owner.status !== "owner" ||
      !owner.passwordHash ||
      !(await verifyPassword(password, owner.passwordHash))
    ) {
      return { success: false as const, error: INVALID_CREDENTIALS };
    }

    await createSession(owner.id);

    return {
      success: true as const,
      user: { id: owner.id, username: owner.username, status: owner.status },
      redirectUrl: getOwnerRedirectUrl(subdomain, requestHeaders.get("host")),
    };
  } catch (error) {
    console.error("Owner sign-in failed:", error);
    return { success: false as const, error: INVALID_CREDENTIALS };
  }
}

export async function loginGuestAction(username: string) {
  try {
    if (!rootDomain) {
      throw new Error(
        "ROOT_DOMAIN must be configured to enable user subdomains.",
      );
    }

    const requestHeaders = await headers();
    const host = requestHeaders.get("host");
    const ownerSubdomain = getSubdomainFromHost(host, rootDomain);
    if (!ownerSubdomain || !host) {
      return { success: false as const, error: INVALID_WISHLIST };
    }

    const owner = await db.orm.public.User.whereUnique({
      subdomain: ownerSubdomain,
    }).first();
    if (!owner || owner.status !== "owner") {
      return { success: false as const, error: INVALID_WISHLIST };
    }

    const normalizedUsername = normalizeUsername(username);
    if (!usernameRegex.test(normalizedUsername)) {
      return {
        success: false as const,
        error: "Username must be 3–24 characters.",
      };
    }

    const guest = await db.orm.public.User.upsert({
      create: {
        username: normalizedUsername,
        ownerId: owner.id,
        status: "guest",
      },
      update: {},
      conflictOn: {
        ownerId: owner.id,
        username: normalizedUsername,
      },
    });

    await createSession(guest.id);

    const protocol = isProduction ? "https" : "http";
    const redirectUrl = new URL(`${protocol}://${host}`).origin;

    return {
      success: true as const,
      user: { id: guest.id, username: guest.username, status: guest.status },
      redirectUrl,
    };
  } catch (error) {
    console.error("Guest sign-in failed:", error);

    if (error instanceof Error && error.message.startsWith("Username must")) {
      return { success: false as const, error: error.message };
    }

    return {
      success: false as const,
      error: "Unable to sign in. Please try again.",
    };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const user = await getCurrentUser();
    const host = (await headers()).get("host");
    const subdomain = rootDomain
      ? getSubdomainFromHost(host, rootDomain)
      : null;

    if (token) {
      const tokenHash = createHash("sha256").update(token).digest("hex");
      await db.orm.public.Session.where({ tokenHash }).delete();
    }

    cookieStore.set("session", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      ...(rootDomain ? { domain: rootDomain } : {}),
      expires: new Date(0),
    });

    let redirectUrl = "/auth";
    if (rootDomain && host && (subdomain || user?.status === "owner")) {
      const port = new URL(`http://${host}`).port;
      const targetHost =
        user?.status === "owner" ? rootDomain : `${subdomain}.${rootDomain}`;
      redirectUrl = `${isProduction ? "https" : "http"}://${targetHost}${port ? `:${port}` : ""}/auth`;
    }

    return { success: true as const, redirectUrl };
  } catch (error) {
    console.error("Logout failed:", error);
    return {
      success: false as const,
      error: "Unable to sign out. Please try again.",
    };
  }
}
