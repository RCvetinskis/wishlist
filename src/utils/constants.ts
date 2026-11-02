export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
export const usernameRegex =
  /^[\p{Script=Latin}\p{Script=Cyrillic}0-9_-]{3,24}$/u;
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
export const rootDomain = process.env.ROOT_DOMAIN;
export const isProduction = process.env.NODE_ENV === "production";
export const defaultLocale = "en";
