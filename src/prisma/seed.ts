import { connectDatabase, db } from "./db.ts";
import {
  getOwnerSubdomain,
  RESERVED_OWNER_SUBDOMAINS,
} from "../utils/domain.ts";
import { hashPassword, isValidPassword } from "../utils/password.ts";
import { usernameRegex } from "../utils/constants.ts";

async function attachLegacyGuestsToSingleOwner() {
  const owners = await db.orm.public.User.where({ status: "owner" }).all();

  if (owners.length === 1) {
    await db.orm.public.User.where({
      status: "guest",
      ownerId: null,
    }).update({ ownerId: owners[0].id });
  } else if (owners.length > 1) {
    console.warn(
      "Legacy guest accounts were not assigned because multiple owners exist.",
    );
  }
}

async function main() {
  await connectDatabase();
  await attachLegacyGuestsToSingleOwner();

  const username = process.env.OWNER_USERNAME?.trim().normalize("NFC").toLowerCase();
  const password = process.env.OWNER_PASSWORD;

  if (!username && !password) {
    console.log("Skipping owner bootstrap; OWNER_USERNAME and OWNER_PASSWORD are unset.");
    return;
  }

  if (
    !username ||
    !password ||
    !usernameRegex.test(username) ||
    RESERVED_OWNER_SUBDOMAINS.has(username)
  ) {
    throw new Error("Set a valid OWNER_USERNAME and OWNER_PASSWORD to bootstrap an owner.");
  }
  if (!isValidPassword(password)) {
    throw new Error("OWNER_PASSWORD must be 12–128 characters.");
  }

  const rootDomain = process.env.ROOT_DOMAIN;
  if (!rootDomain) {
    throw new Error("ROOT_DOMAIN must be configured to bootstrap an owner.");
  }

  const subdomain = getOwnerSubdomain(username, rootDomain);
  const existingOwner =
    (await db.orm.public.User.whereUnique({ subdomain }).first()) ??
    (await db.orm.public.User.where({ username, status: "owner" }).first());

  if (existingOwner) {
    if (
      existingOwner.status !== "owner" ||
      (existingOwner.subdomain && existingOwner.subdomain !== subdomain)
    ) {
      throw new Error(`The subdomain "${username}" is not available for owner bootstrap.`);
    }

    await db.orm.public.User.where({ id: existingOwner.id }).update({
      subdomain,
      ...(!existingOwner.passwordHash && {
        passwordHash: await hashPassword(password),
      }),
    });
    await attachLegacyGuestsToSingleOwner();

    console.log(`Owner "${username}" is ready.`);
    return;
  }

  await db.orm.public.User.create({
    username,
    subdomain,
    passwordHash: await hashPassword(password),
    status: "owner",
  });
  await attachLegacyGuestsToSingleOwner();

  console.log(`Created owner "${username}".`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
