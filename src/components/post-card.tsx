"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";

import type { getPosts } from "@/src/services/posts";
import { DeletePost, ReservePost, UnreserverPost } from "../actions/post";
import { toast } from "@/components/ui/toast";
import { useI18n } from "@/src/components/i18n";
import { capitalize } from "../utils/helpers";
import { Ribbon } from "./ribbon";
import ImagePreview from "./image-preview";
import { cn } from "cn";

type PostCardProps = {
  post: Awaited<ReturnType<typeof getPosts>>["posts"][number];
  currentUserId: number;
  isOwner: boolean;
};

const PostCard = ({ post, currentUserId, isOwner }: PostCardProps) => {
  const { t, translateServerMessage } = useI18n();
  const [reservedById, setReservedById] = useState(post.reservedById);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  const [isPending, startTransition] = useTransition();
  const isReserved = reservedById !== null;
  const isReservedByMe = reservedById === currentUserId;
  const isAuthor = isOwner && post.authorId === currentUserId;

  const handleReservation = () => {
    startTransition(async () => {
      const result = isReservedByMe
        ? await UnreserverPost(post.id)
        : await ReservePost(post.id);
      if (!result.success) {
        toast.add({
          type: "error",
          title: translateServerMessage(result.error ?? t("unableToReserve")),
        });
        return;
      }

      setReservedById(isReservedByMe ? null : currentUserId);
      toast.add({
        type: "success",
        title: isReservedByMe ? t("reservationCancelled") : t("itemReserved"),
      });
    });
  };

  const handleDelete = () => {
    if (!window.confirm(t("confirmDelete"))) {
      return;
    }

    startTransition(async () => {
      const result = await DeletePost(post.id);
      if (!result.success) {
        toast.add({
          type: "error",
          title: translateServerMessage(result.error),
        });

        return;
      }

      setIsDeleted(true);
    });
  };

  if (isDeleted) {
    return null;
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-transparent shadow-md shadow-primary",
        isReserved && "shadow-secondary",
      )}
    >
      <Ribbon
        variant={isReserved ? "secondary" : "primary"}
        position="diagonal-right"
      >
        {isReserved ? t("reserved") : t("available")}
      </Ribbon>

      <div className="relative aspect-4/3 w-full bg-muted">
        {post.image ? (
          <ImagePreview
            src={`/api/posts/${post.id}/image`}
            alt={post.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : post.imageUrl ? (
          <ImagePreview
            src={post.imageUrl}
            alt={post.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t("noImage")}
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("itemAddedBy", { name: capitalize(post.author.username) })}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {post.content && (
          <div>
            <p
              id={`post-content-${post.id}`}
              className={`${isContentExpanded ? "" : "line-clamp-2"} whitespace-pre-wrap text-sm text-muted-foreground`}
            >
              {post.content}
            </p>
            {post.content.length > 50 && (
              <Button
                type="button"
                variant="link"
                size="xs"
                aria-expanded={isContentExpanded}
                aria-controls={`post-content-${post.id}`}
                className="mt-1 px-0"
                onClick={() => setIsContentExpanded((expanded) => !expanded)}
              >
                {isContentExpanded ? t("showLess") : t("showMore")}
              </Button>
            )}
          </div>
        )}

        {post.itemUrl && (
          <Link
            href={post.itemUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline underline-offset-4"
          >
            {t("viewItem")}
          </Link>
        )}
      </CardContent>

      <CardFooter className="mt-auto px-1">
        <div className="flex flex-wrap gap-2 mx-auto w-full">
          {isReserved && !isReservedByMe ? (
            <Button variant={"secondary"} className="min-w-0 flex-1" disabled>
              <span className="block min-w-0 max-w-full truncate">
                {t("alreadyReserved")}
              </span>
            </Button>
          ) : (
            <Button
              className="min-w-0 flex-1"
              variant={isReservedByMe ? "outline" : "default"}
              disabled={isPending}
              onClick={handleReservation}
            >
              <span className="block min-w-0 max-w-full truncate">
                {isPending
                  ? t("pleaseWait")
                  : isReservedByMe
                    ? t("cancelReservation")
                    : t("reserveItem")}
              </span>
            </Button>
          )}
          {isAuthor && (
            <>
              <Link
                href={`/posts/create/${post.id}`}
                className={buttonVariants({ variant: "outline" })}
              >
                {t("edit")}
              </Link>
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={handleDelete}
              >
                {t("delete")}
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
