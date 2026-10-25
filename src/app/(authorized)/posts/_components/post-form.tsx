"use client";

import { useState } from "react";
import type { ComponentProps } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImagePicker from "./image-picker";
import { CreatePost, UpdatePost } from "@/src/actions/post";
import { useRouter } from "next/navigation";
import { useI18n } from "@/src/components/i18n";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type PostFormProps = {
  initialPost?: {
    id: number;
    title: string;
    content: string | null;
    itemUrl: string | null;
    imageUrl: string | null;
    imagePreviewUrl?: string;
  };
};

const PostForm = ({ initialPost }: PostFormProps) => {
  const router = useRouter();
  const { t, translateServerMessage } = useI18n();

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [itemUrl, setItemUrl] = useState(initialPost?.itemUrl ?? "");
  const [imageUrl, setImageUrl] = useState(initialPost?.imageUrl ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageChanged, setImageChanged] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleImageUrlChange = (url: string) => {
    setImageChanged(true);
    setImageUrl(url);
  };

  const handleImageFileChange = (file: File | null) => {
    setImageChanged(true);
    setImageFile(file);
  };

  const handleSubmit = async (event: FormSubmitEvent) => {
    event.preventDefault();
    if (!title.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      setError("");

      const params = {
        title,
        content,
        itemUrl,
        imageUrl: imageFile ? undefined : imageUrl.trim() || undefined,
        imageFile: imageFile ?? undefined,
      };
      const result = initialPost
        ? await UpdatePost(initialPost.id, { ...params, imageChanged })
        : await CreatePost(params);

      if (!result.success) {
        setError(translateServerMessage(result.error));
        return;
      }
      router.push("/posts");
    } catch {
      setError(t(initialPost ? "unableToUpdate" : "unableToCreate"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialPost ? t("editWishlistItem") : t("addWishlistItem")}
        </CardTitle>
        <CardDescription>
          {initialPost
            ? t("editWishlistDescription")
            : t("addWishlistDescription")}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">{t("itemNameRequired")}</Label>
            <Input
              id="title"
              name="title"
              placeholder={t("titlePlaceholder")}
              value={title}
              onChange={(event) => {
                event.currentTarget.setCustomValidity("");
                setTitle(event.target.value);
              }}
              onInvalid={(event) =>
                event.currentTarget.setCustomValidity(t("titleRequired"))
              }
              maxLength={200}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t("description")}</Label>
            <Textarea
              id="content"
              name="content"
              placeholder={t("descriptionPlaceholder")}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemUrl">{t("productUrl")}</Label>
            <Input
              id="itemUrl"
              name="itemUrl"
              type="url"
              placeholder={t("productUrlPlaceholder")}
              value={itemUrl}
              onChange={(event) => {
                event.currentTarget.setCustomValidity("");
                setItemUrl(event.target.value);
              }}
              onInvalid={(event) =>
                event.currentTarget.setCustomValidity(t("productUrlInvalid"))
              }
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {t("productUrlHelp")}
            </p>
          </div>

          <ImagePicker
            value={imageUrl}
            onChange={handleImageUrlChange}
            onFileChange={handleImageFileChange}
            initialMode={initialPost?.imageUrl ? "url" : "upload"}
            initialPreviewUrl={
              imageChanged ? undefined : initialPost?.imagePreviewUrl
            }
            maxSizeMB={4}
          />

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="pt-4">
          <Button
            type="submit"
            className="w-full h-12"
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting
              ? initialPost
                ? t("savingChanges")
                : t("addingItem")
              : initialPost
                ? t("saveChanges")
                : t("addToWishlist")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PostForm;
