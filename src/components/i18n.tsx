"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { messages, type MessageKey } from "../messages";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
export type Locale = "en" | "lt";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
  translateServerMessage: (message: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const LOCALE_STORAGE_KEY = "wishlist-locale";
const LOCALE_CHANGE_EVENT = "wishlist-locale-change";

function supportedLocale(value: string | null | undefined): Locale | null {
  if (value?.toLowerCase().startsWith("lt")) return "lt";
  if (value?.toLowerCase().startsWith("en")) return "en";
  return null;
}

function getLocale(): Locale {
  return (
    supportedLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY)) ??
    supportedLocale(navigator.language) ??
    "lt"
  );
}

function subscribeToLocale(callback: () => void) {
  window.addEventListener(LOCALE_CHANGE_EVENT, callback);
  return () => window.removeEventListener(LOCALE_CHANGE_EVENT, callback);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore<Locale>(
    subscribeToLocale,
    getLocale,
    () => "lt",
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (nextLocale: Locale) => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
  };

  const value = useMemo<I18nContextValue>(() => {
    const t: I18nContextValue["t"] = (key, values) => {
      let message: string = messages[locale][key];
      for (const [name, replacement] of Object.entries(values ?? {})) {
        message = message.replaceAll(`{{${name}}}`, String(replacement));
      }
      return message;
    };

    const translateServerMessage: I18nContextValue["translateServerMessage"] = (
      message,
    ) => {
      const key = (Object.keys(messages.en) as MessageKey[]).find(
        (candidate) => messages.en[candidate] === message,
      );
      return key ? t(key) : message;
    };

    return { locale, setLocale, t, translateServerMessage };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }
  return context;
}

export function LocalizedText({
  message,
  values,
}: {
  message: MessageKey;
  values?: Record<string, string | number>;
}) {
  const { t } = useI18n();
  return t(message, values);
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div>
      <Label className="sr-only" htmlFor="language-switcher">
        {t("language")}
      </Label>
      <Select
        value={locale}
        onValueChange={(value) => {
          const nextLocale = supportedLocale(value);
          if (nextLocale) setLocale(nextLocale);
        }}
      >
        <SelectTrigger id="language-switcher" aria-label={t("language")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="lt">{compact ? "LT" : "Lietuvių"}</SelectItem>
            <SelectItem value="en">{compact ? "EN" : "English"}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
