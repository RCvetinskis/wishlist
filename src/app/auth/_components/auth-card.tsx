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
import { loginAction } from "@/src/actions/auth";
import { useI18n } from "@/src/components/i18n";
import { useRouter } from "next/navigation";
type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

const AuthCard = () => {
  const { t, translateServerMessage } = useI18n();
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: FormSubmitEvent) => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError("");

      const result = await loginAction(trimmedUsername);

      if (!result.success) {
        setError(translateServerMessage(result.error));
        return;
      }
      router.push("/");
    } catch {
      setError(t("genericTryAgain"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-sm border-pink-200/70 shadow-xl shadow-pink-200/20">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-pink-100 text-2xl">
          🎀
        </div>

        <CardTitle className="text-2xl font-bold tracking-tight">
          {t("welcomeToWishlist")}
        </CardTitle>

        <CardDescription>{t("authDescription")}</CardDescription>
      </CardHeader>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <CardContent className="space-y-2">
          <Label htmlFor="username">{t("username")}</Label>

          <Input
            id="username"
            name="username"
            placeholder={t("usernamePlaceholder")}
            autoComplete="username"
            autoFocus
            minLength={3}
            maxLength={24}
            pattern="[A-Za-z0-9ĄČĘĖĮŠŲŪŽąčęėįšųūž_\-]{3,24}"
            title={t("usernameTitle")}
            value={username}
            onChange={(event) => {
              event.currentTarget.setCustomValidity("");
              setUsername(event.target.value.normalize("NFC"));
            }}
            onInvalid={(event) =>
              event.currentTarget.setCustomValidity(t("usernameTitle"))
            }
            required
            disabled={isSubmitting}
            className="h-11 focus-visible:ring-pink-300"
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-4">
          <Button
            type="submit"
            className="h-11 w-full"
            disabled={!username.trim() || isSubmitting}
          >
            {isSubmitting ? t("gettingStarted") : t("letsGetStarted")}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {t("authTagline")}
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AuthCard;
