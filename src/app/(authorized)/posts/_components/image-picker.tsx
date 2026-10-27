"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Link2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/src/components/i18n";

type ImagePickerProps = {
  value: string;
  onChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
  maxSizeMB?: number;
  initialMode?: ImageMode;
  initialPreviewUrl?: string;
};

type ImageMode = "upload" | "url";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export default function ImagePicker({
  value,
  onChange,
  onFileChange,
  maxSizeMB = 5,
  initialMode = "upload",
  initialPreviewUrl,
}: ImagePickerProps) {
  const { t } = useI18n();
  const [mode, setMode] = useState<ImageMode>(initialMode);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const selectFile = (file?: File) => {
    if (!file) return;

    setError("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t("chooseSupportedImage"));
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(t("imageTooLarge", { size: maxSizeMB }));
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);
    setMode("upload");
    onChange("");
    onFileChange(file);
  };

  const clearImage = () => {
    setPreview("");
    onChange("");
    onFileChange(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const switchMode = (nextMode: ImageMode) => {
    if (mode === nextMode) return;

    setMode(nextMode);
    setError("");
    setPreview("");
    onChange("");
    onFileChange(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    onFileChange(null);
    setPreview("");
    setError("");
  };

  const imagePreview = preview || value || initialPreviewUrl;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>{t("image")}</Label>
        <p className="text-sm text-muted-foreground">{t("imageHelp")}</p>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-3">
        <Button
          type="button"
          variant={mode === "upload" ? "secondary" : "outline"}
          className="h-auto text-xs justify-start gap-2 py-3"
          onClick={() => switchMode("upload")}
        >
          <Upload className="size-4 shrink-0" />
          {t("uploadImage")}
        </Button>

        <Button
          size={"lg"}
          type="button"
          variant={mode === "url" ? "secondary" : "outline"}
          className="h-auto text-xs justify-start gap-2 py-3"
          onClick={() => switchMode("url")}
        >
          <Link2 className="size-4 shrink-0" />
          {t("imageUrl")}
        </Button>
      </div>

      {mode === "upload" && (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            selectFile(event.dataTransfer.files[0]);
          }}
          className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => selectFile(event.target.files?.[0])}
          />

          <ImageIcon className="mx-auto mb-3 size-8 text-muted-foreground" />

          <p className="text-sm font-medium">{t("dragDropImage")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("or")}</p>

          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() => fileInputRef.current?.click()}
          >
            {t("chooseFile")}
          </Button>

          <p className="mt-3 text-xs text-muted-foreground">
            {t("maxImageSize", { size: maxSizeMB })}
          </p>
        </div>
      )}

      {mode === "url" && (
        <div className="space-y-2">
          <Label htmlFor="imageUrl">{t("imageUrl")}</Label>
          <Input
            id="imageUrl"
            type="url"
            placeholder={t("imageUrlPlaceholder")}
            value={value}
            onChange={(event) => handleUrlChange(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">{t("imageUrlHelp")}</p>
        </div>
      )}

      {imagePreview && (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <img
            src={imagePreview}
            alt={t("imagePreview")}
            className="size-20 rounded-md border object-cover"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{t("imagePreview")}</p>
            <p className="truncate text-xs text-muted-foreground">
              {preview
                ? t("uploadedFileSelected")
                : mode === "upload" && initialPreviewUrl
                  ? t("currentUploadedImage")
                  : value}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("removeImage")}
            onClick={clearImage}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
