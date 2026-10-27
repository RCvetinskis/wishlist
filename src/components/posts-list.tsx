"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { LocalizedText, useI18n } from "@/src/components/i18n";
import type { getPosts } from "@/src/services/posts";
import PostCard from "./post-card";

type MobileColumns = 1 | 2;
const MOBILE_COLUMNS_STORAGE_KEY = "wishlist-mobile-columns";
const MOBILE_COLUMNS_CHANGE_EVENT = "wishlist-mobile-columns-change";

function getMobileColumns(): MobileColumns {
  return window.localStorage.getItem(MOBILE_COLUMNS_STORAGE_KEY) === "2"
    ? 2
    : 1;
}

function subscribeToMobileColumns(callback: () => void) {
  window.addEventListener(MOBILE_COLUMNS_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(MOBILE_COLUMNS_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function setMobileColumns(columns: MobileColumns) {
  window.localStorage.setItem(MOBILE_COLUMNS_STORAGE_KEY, String(columns));
  window.dispatchEvent(new Event(MOBILE_COLUMNS_CHANGE_EVENT));
}

type Props = {
  posts: Awaited<ReturnType<typeof getPosts>>["posts"];
  currentUserId: number;
  isOwner: boolean;
  search: string;
  reservedByMe?: boolean;
};

export default function PostsList({
  posts,
  currentUserId,
  isOwner,
  search,
  reservedByMe = false,
}: Props) {
  const mobileColumns = useSyncExternalStore(
    subscribeToMobileColumns,
    getMobileColumns,
    () => 1,
  );
  const { t } = useI18n();

  if (posts.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        <LocalizedText
          message={
            search
              ? "noSearchResults"
              : reservedByMe
                ? "noReservations"
                : "noPosts"
          }
        />
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label={t("mobileColumns")}
        className="flex items-center justify-end gap-2 md:hidden"
      >
        <span className="text-sm text-muted-foreground">
          {t("mobileColumns")}:
        </span>
        <Button
          type="button"
          size="sm"
          variant={mobileColumns === 1 ? "secondary" : "outline"}
          aria-pressed={mobileColumns === 1}
          onClick={() => setMobileColumns(1)}
        >
          {t("oneColumn")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mobileColumns === 2 ? "secondary" : "outline"}
          aria-pressed={mobileColumns === 2}
          onClick={() => setMobileColumns(2)}
        >
          {t("twoColumns")}
        </Button>
      </div>
      <div
        className={
          mobileColumns === 1
            ? "grid grid-cols-1 gap-3 md:grid-cols-3 2xl:grid-cols-4"
            : "grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4"
        }
      >
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            isOwner={isOwner}
          />
        ))}
      </div>
    </div>
  );
}
