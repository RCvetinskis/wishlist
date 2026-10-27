export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
export const usernameRegex =
  /^[\p{Script=Latin}\p{Script=Cyrillic}0-9_-]{3,24}$/u;
