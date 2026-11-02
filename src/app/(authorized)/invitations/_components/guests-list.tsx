"use client";

import { UsersRound, UserRound } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/src/components/i18n";

type Guest = {
  id: number;
  username: string;
  createdAt: string;
};

type Props = {
  guests: Guest[];
};

const localeCodes = {
  en: "en-US",
  lt: "lt-LT",
  ru: "ru-RU",
} as const;

const GuestsList = ({ guests }: Props) => {
  const { locale, t } = useI18n();
  const joinedDateFormatter = new Intl.DateTimeFormat(localeCodes[locale], {
    dateStyle: "medium",
    timeZone: "UTC",
  });

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UsersRound className="size-5 text-primary" aria-hidden="true" />
            {t("guestListTitle")}
          </CardTitle>
          <CardDescription>{t("guestListDescription")}</CardDescription>
        </div>
        <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {t("guestCount", { count: guests.length })}
        </span>
      </CardHeader>

      <CardContent>
        {guests.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed bg-muted/30 px-5 py-10 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
              <UsersRound className="size-5" aria-hidden="true" />
            </div>
            <p className="font-medium">{t("noGuestsYet")}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t("noGuestsYetDescription")}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {guests.map((guest) => (
              <li
                key={guest.id}
                className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0 sm:gap-4"
              >
                <div
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-rose-200 font-semibold text-rose-700 ring-1 ring-rose-200/70 dark:from-pink-950 dark:to-rose-900 dark:text-rose-100 dark:ring-rose-800"
                >
                  {guest.username.slice(0, 1).toLocaleUpperCase(localeCodes[locale])}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{guest.username}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {t("guestJoined", {
                      date: joinedDateFormatter.format(new Date(guest.createdAt)),
                    })}
                  </p>
                </div>
                <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
                  <UserRound className="size-3.5" aria-hidden="true" />
                  {t("guestRole")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default GuestsList;
