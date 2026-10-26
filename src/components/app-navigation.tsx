"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Moon, Plus, Sun } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher, useI18n } from "@/src/components/i18n";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";
import LogoutButton from "./logout-button";

type AppNavigationProps = {
  isOwner: boolean;
};

export default function AppNavigation({ isOwner }: AppNavigationProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const links = isOwner
    ? [
        {
          href: "/",
          label: t("home"),
          icon: Home,
          isActive: pathname === "/",
        },
        {
          href: "/posts",
          label: t("posts"),
          icon: List,
          isActive: pathname === "/posts",
        },
        {
          href: "/posts/create",
          label: t("createPost"),
          icon: Plus,
          isActive: pathname.startsWith("/posts/create"),
        },
      ]
    : [
        {
          href: "/",
          label: t("home"),
          icon: Home,
          isActive: pathname === "/",
        },
      ];

  return (
    <header className="sticky rounded top-0 z-40 mb-6 border-b border-border/70 bg-background/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-350 items-center justify-between gap-3 px-3 py-2 sm:px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-xl">
            🎀
          </span>
          <span className="hidden sm:inline">Wishlist</span>
        </Link>

        <nav
          aria-label={t("mainNavigation")}
          className="flex min-w-0 flex-1 justify-center gap-1 sm:gap-2"
        >
          {links.map(({ href, label, icon: Icon, isActive }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                "h-10 min-w-0 gap-1.5 px-2.5 sm:px-3",
                isActive && "font-semibold",
              )}
            >
              <Icon aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher compact />
          <Button
            variant={"outline"}
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? t("switchToLight") : t("switchToDark")
            }
            title={theme === "dark" ? t("switchToLight") : t("switchToDark")}
            className={cn("size-10")}
          >
            {theme === "dark" ? (
              <Sun aria-hidden="true" />
            ) : (
              <Moon aria-hidden="true" />
            )}
          </Button>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
