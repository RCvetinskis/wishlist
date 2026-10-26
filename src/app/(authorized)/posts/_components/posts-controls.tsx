"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/src/components/i18n";

type PostsControlsProps = {
  search: string;
  page: number;
  hasMore: boolean;
  basePath: string;
};

function pageHref(page: number, search: string, basePath: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));

  const path = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  return `${path}?${params.toString()}`;
}

export default function PostsControls({
  search,
  page,
  hasMore,
  basePath,
}: PostsControlsProps) {
  const { t } = useI18n();
  const router = useRouter();

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    params.set("page", "1");

    const path = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
    router.push(`${path}?${params.toString()}`);
  }

  return (
    <div className="space-y-4 pt-2">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          className="shadow shadow-primary"
          type="search"
          name="search"
          defaultValue={search}
          placeholder={t("searchWishlist")}
          aria-label={t("searchWishlist")}
          maxLength={100}
        />
        <Button type="submit">{t("search")}</Button>
        {search && (
          <Link
            href={basePath}
            className={buttonVariants({ variant: "outline" })}
          >
            {t("clearSearch")}
          </Link>
        )}
      </form>

      {(page > 1 || hasMore) && (
        <nav
          aria-label={t("pagination")}
          className="flex items-center justify-center gap-4"
        >
          {page > 1 ? (
            <Link
              href={pageHref(page - 1, search, basePath)}
              className={buttonVariants({ variant: "outline" })}
            >
              {t("previousPage")}
            </Link>
          ) : (
            <Button variant="outline" disabled>
              {t("previousPage")}
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            {t("pageNumber", { page })}
          </span>
          {hasMore ? (
            <Link
              href={pageHref(page + 1, search, basePath)}
              className={buttonVariants({ variant: "outline" })}
            >
              {t("nextPage")}
            </Link>
          ) : (
            <Button variant="outline" disabled>
              {t("nextPage")}
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}
