"use client";

import { Camera, Copy, Mail, MessageCircle, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useI18n } from "@/src/components/i18n";

type Props = {
  wishlistUrl: string;
};

async function copyText(value: string) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();

  if (!copied) {
    throw new Error("Clipboard access is unavailable.");
  }
}

export default function InvitationActions({ wishlistUrl }: Props) {
  const { t } = useI18n();
  const emailUrl = `mailto:?subject=${encodeURIComponent(t("inviteEmailSubject"))}&body=${encodeURIComponent(`${t("inviteEmailBody")}\n\n${wishlistUrl}`)}`;

  const copyLink = async () => {
    try {
      await copyText(wishlistUrl);
      toast.add({ type: "success", title: t("inviteLinkCopied") });
    } catch (error) {
      console.error("Could not copy wishlist invitation link:", error);
      toast.add({ type: "error", title: t("inviteLinkCopyFailed") });
    }
  };

  const shareWishlist = async () => {
    if (!navigator.share) {
      try {
        await copyText(wishlistUrl);
        toast.add({ type: "success", title: t("inviteShareFallback") });
      } catch (error) {
        console.error(
          "Could not share or copy wishlist invitation link:",
          error,
        );
        toast.add({ type: "error", title: t("inviteLinkCopyFailed") });
      }
      return;
    }

    try {
      await navigator.share({
        title: t("wishlistLink"),
        text: t("inviteEmailBody"),
        url: wishlistUrl,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("Could not share wishlist invitation:", error);
      toast.add({ type: "error", title: t("inviteShareFailed") });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          aria-label={t("wishlistLink")}
          readOnly
          value={wishlistUrl}
          onFocus={(event) => event.currentTarget.select()}
          className="h-10"
        />
        <Button
          type="button"
          variant="outline"
          className="h-10 shrink-0"
          onClick={() => void shareWishlist()}
        >
          <Share2 aria-hidden="true" />
          {t("share")}
        </Button>
        <Button type="button" className="h-10 shrink-0" onClick={copyLink}>
          <Copy aria-hidden="true" />
          {t("copyLink")}
        </Button>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium">{t("inviteVia")}</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button
            render={<a href={emailUrl} />}
            nativeButton={false}
            variant="outline"
            className="h-10"
          >
            <Mail aria-hidden="true" />
            {t("email")}
          </Button>
          <Button
            render={
              <a
                href="https://www.messenger.com/"
                target="_blank"
                rel="noreferrer"
              />
            }
            nativeButton={false}
            variant="outline"
            className="h-10"
            onClick={() => void copyLink()}
          >
            <MessageCircle aria-hidden="true" />
            Messenger
          </Button>
          <Button
            render={
              <a
                href="https://www.instagram.com/direct/inbox/"
                target="_blank"
                rel="noreferrer"
              />
            }
            nativeButton={false}
            variant="outline"
            className="h-10"
            onClick={() => void copyLink()}
          >
            <Camera aria-hidden="true" />
            Instagram
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {t("messengerInviteHelp")}
      </p>
    </div>
  );
}
