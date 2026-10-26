"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { getPosts } from "@/src/services/posts";
import { DeletePost, ReservePost, UnreserverPost } from "../actions/post";
import { toast } from "@/components/ui/toast";
import { useI18n } from "@/src/components/i18n";
import { capitalize } from "../utils/helpers";

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
    <Card className="overflow-hidden bg-transparent shadow shadow-primary">
      <div className="relative aspect-4/3 w-full bg-muted">
        {post.image ? (
          <Image
            src={`/api/posts/${post.id}/image`}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            loading="eager"
          />
        ) : post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            loading="eager"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t("noImage")}
          </div>
        )}

        <Badge
          className="absolute right-3 top-3"
          variant={isReserved ? "secondary" : "default"}
        >
          {isReserved ? t("reserved") : t("available")}
        </Badge>
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
              className={`${isContentExpanded ? "" : "line-clamp-6"} whitespace-pre-wrap text-sm text-muted-foreground`}
            >
              {post.content}
            </p>
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

      <CardFooter className="pt-6 mt-auto">
        <div className="w-full space-y-2">
          <div className="flex flex-wrap gap-2">
            {isReserved && !isReservedByMe ? (
              <Button className="flex-1" disabled>
                {t("alreadyReserved")}
              </Button>
            ) : (
              <Button
                className="flex-1"
                variant={isReservedByMe ? "outline" : "default"}
                disabled={isPending}
                onClick={handleReservation}
              >
                {isPending
                  ? t("pleaseWait")
                  : isReservedByMe
                    ? t("cancelReservation")
                    : t("reserveItem")}
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
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
