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
import { loginOwnerAction, registerOwnerAction } from "@/src/actions/auth";
import { useI18n } from "@/src/components/i18n";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/src/utils/password";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

export default function OwnerAuthCard() {
  const { t, translateServerMessage } = useI18n();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormSubmitEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError("");

      const action = isRegistering ? registerOwnerAction : loginOwnerAction;
      const result = await action(username.trim(), password);

      if (!result.success) {
        setError(translateServerMessage(result.error));
        return;
      }

      window.location.assign(result.redirectUrl);
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
          {isRegistering ? t("ownerRegisterTitle") : t("ownerLoginTitle")}
        </CardTitle>
        <CardDescription>{t("ownerAuthDescription")}</CardDescription>
      </CardHeader>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="owner-username">{t("username")}</Label>
            <Input
              id="owner-username"
              name="username"
              placeholder={t("usernamePlaceholder")}
              autoComplete="username"
              autoFocus
              minLength={3}
              maxLength={24}
              pattern="[A-Za-zА-Яа-яЁёĄČĘĖĮŠŲŪŽąčęėįšųūž0-9_\u{2D}]{3,24}"
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner-password">{t("password")}</Label>
            <Input
              id="owner-password"
              name="password"
              type="password"
              autoComplete={isRegistering ? "new-password" : "current-password"}
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={MAX_PASSWORD_LENGTH}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isSubmitting}
            />
            {isRegistering && (
              <p className="text-xs text-muted-foreground">
                {t("passwordLengthHelp")}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-1">
          <Button
            type="submit"
            className="h-11 w-full"
            disabled={!username.trim() || !password || isSubmitting}
          >
            {isSubmitting
              ? t("loading")
              : isRegistering
                ? t("createOwnerAccount")
                : t("signIn")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={isSubmitting}
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
          >
            {isRegistering
              ? t("switchToOwnerLogin")
              : t("switchToOwnerRegister")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
