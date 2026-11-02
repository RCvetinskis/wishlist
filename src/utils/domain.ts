import { domainToUnicode } from "node:url";

export const RESERVED_OWNER_SUBDOMAINS = new Set(["api", "auth", "www"]);

export function getSubdomainFromHost(
  host: string | null,
  rootDomain: string,
): string | null {
  if (!host) return null;

  const hostname = new URL(`http://${host}`).hostname.toLowerCase();
  const rootHostname = new URL(`http://${rootDomain}`).hostname.toLowerCase();
  const suffix = `.${rootHostname}`;

  if (!hostname.endsWith(suffix)) return null;

  const subdomain = hostname.slice(0, -suffix.length);
  if (!subdomain || subdomain.includes(".") || subdomain === "www") {
    return null;
  }

  return domainToUnicode(subdomain).toLowerCase();
}

export function getOwnerSubdomain(username: string, rootDomain: string): string {
  const hostname = new URL(`https://${username}.${rootDomain}`).hostname;
  const rootHostname = new URL(`https://${rootDomain}`).hostname;
  return domainToUnicode(hostname.slice(0, -(rootHostname.length + 1))).toLowerCase();
}
