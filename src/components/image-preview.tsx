"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/src/components/i18n";

type Props = {
  src: string;
  alt: string;
  sizes: string;
};

export default function ImagePreview({ src, alt, sizes }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <>
      <Button
        type="button"
        variant={"ghost"}
        className="absolute inset-0 block size-full cursor-zoom-in"
        aria-label={`${t("imagePreview")}: ${alt}`}
        onClick={() => setIsOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      </Button>
      <dialog
        ref={dialogRef}
        aria-label={alt}
        className="fixed inset-0 m-0 h-dvh w-screen max-h-none max-w-none border-0 bg-black/20 p-4 text-white backdrop:bg-black/80"
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false);
        }}
      >
        <div className="relative mx-auto flex h-full w-full max-w-7xl items-center justify-center">
          <div className="relative h-full max-h-[90dvh] w-full">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            className="absolute right-0 top-0 z-10 rounded-full"
            aria-label={t("closeImagePreview")}
            onClick={() => setIsOpen(false)}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      </dialog>
    </>
  );
}
