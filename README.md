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

To bootstrap an owner from `src/prisma/seed.ts`, set `OWNER_USERNAME`, `OWNER_PASSWORD` (12–128 characters), and `ROOT_DOMAIN`. Otherwise, owners can register on the apex domain.

## User subdomains

Set `ROOT_DOMAIN` to the app's apex domain without a scheme or leading dot (for example, `example.com`). Configure DNS with a wildcard record (`*.example.com`) pointing to the app, and configure the hosting platform to accept wildcard subdomains and provision a wildcard TLS certificate. The apex domain should also point to the app so users can sign in there.

Owners register or sign in on the apex domain with a username and password, then are redirected to `https://<username>.<ROOT_DOMAIN>`. Guests visit an owner's subdomain and use the existing username-only sign-in form; their guest account and wishlist access are scoped to that owner. The shared session cookie is scoped to `ROOT_DOMAIN`. For local development, use `ROOT_DOMAIN=lvh.me` (it resolves to `127.0.0.1` with wildcard subdomains) rather than `localhost`, whose cookies are not shared reliably with subdomains. Owner login then redirects to `<username>.lvh.me` on the same development port.

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
