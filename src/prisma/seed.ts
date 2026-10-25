import { connectDatabase, db } from "./db.ts";

async function main() {
  await connectDatabase();

  const username = "nastia".trim().toLowerCase();

  const existingUser = await db.orm.public.User.whereUnique({
    username,
  }).first();

  if (existingUser) {
    if (existingUser.status !== "owner") {
      await db.orm.public.User.where({ id: existingUser.id }).update({
        status: "owner",
      });
    }

    console.log(`User "${username}" is an owner.`);
    return;
  }

  await db.orm.public.User.create({
    username,
    status: "owner",
  });

  console.log(`Created owner "${username}".`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
