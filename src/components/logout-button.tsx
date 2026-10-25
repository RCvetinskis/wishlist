"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useI18n } from "@/src/components/i18n";
import { logoutAction } from "@/src/actions/auth";

export default function LogoutButton() {
  const router = useRouter();
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logoutAction();
      if (!result.success) {
        toast.add({ type: "error", title: t("logoutFailed") });
        return;
      }

      router.replace("/auth");
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      disabled={isPending}
      aria-label={isPending ? t("loggingOut") : t("logout")}
      title={isPending ? t("loggingOut") : t("logout")}
      className="size-10 px-2 sm:w-auto sm:px-3"
    >
      <LogOut aria-hidden="true" />
      <span className="hidden sm:inline">
        {isPending ? t("loggingOut") : t("logout")}
      </span>
    </Button>
  );
}
