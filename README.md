# wishlist

A minimal next app with Prisma 8 and Prisma Composer.

## Run locally

```bash
npm run dev:composer
```

This builds the app and starts it with Composer. PostgreSQL projects get a local Prisma Postgres database and apply the committed migrations automatically.

## Deploy

```bash
npm run deploy
```

The deploy script builds the framework output, provisions Prisma Postgres when selected, applies migrations, and deploys the app to Prisma Compute.

The starter users are inserted idempotently from `src/prisma/seed.ts` on the first database query through the Composer service binding.

## Languages

The interface supports Russian, English, and Lithuanian. Russian is selected by default unless a language choice has already been saved. Use the language selector in the top-right corner to switch languages.

## Prisma

- Contract: `src/prisma/contract.prisma`
- Prisma and Composer config: `prisma.config.ts`
- Composer app: `module.ts` and `service.ts`

After changing the contract, run:

```bash
npm run contract:emit
```

To use the framework's development server directly, run `npm run dev`. This direct mode requires `DATABASE_URL`.
