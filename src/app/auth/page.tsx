import AuthCard from "./_components/auth-card";
import OwnerAuthCard from "./_components/owner-auth-card";
import { LanguageSwitcher } from "@/src/components/i18n";
import { headers } from "next/headers";
import { isProduction, rootDomain } from "@/src/utils/constants";
import { getSubdomainFromHost } from "@/src/utils/domain";
import { LocalizedText } from "@/src/components/i18n";
import Link from "next/link";

const AuthPage = async () => {
  const host = (await headers()).get("host");
  const ownerSubdomain = rootDomain
    ? getSubdomainFromHost(host, rootDomain)
    : null;
  const isUserSubdomain = ownerSubdomain !== null;
  const ownerAuthUrl =
    isUserSubdomain && rootDomain
      ? (() => {
          const url = new URL(
            `${isProduction ? "https" : "http"}://${rootDomain}/auth`,
          );
          if (!isProduction && host) {
            url.port = new URL(`http://${host}`).port;
          }
          return url.toString();
        })()
      : null;

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="flex w-full flex-col items-center gap-4">
        {ownerSubdomain ? (
          <AuthCard ownerSubdomain={ownerSubdomain} />
        ) : (
          <OwnerAuthCard />
        )}
        {ownerAuthUrl && (
          <Link
            href={ownerAuthUrl}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            <LocalizedText message="createOwnWishlist" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
