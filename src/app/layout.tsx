import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import { I18nProvider } from "@/src/components/i18n";
import { ThemeProvider } from "@/src/components/theme-provider";
import { cookies } from "next/headers";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const THEME_STORAGE_KEY = "wishlist-theme";

export const metadata: Metadata = {
  title: "Wishlist",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const savedTheme = (await cookies()).get(THEME_STORAGE_KEY)?.value;
  const initialTheme = savedTheme === "dark" ? "dark" : "light";

  return (
    <html
      suppressHydrationWarning
      lang="ru"
      data-theme-domain={process.env.ROOT_DOMAIN}
      className={cn(
        "font-sans",
        geist.variable,
        initialTheme === "dark" && "dark",
      )}
    >
      <body suppressHydrationWarning>
        <ThemeProvider
          initialTheme={initialTheme}
          cookieDomain={process.env.ROOT_DOMAIN}
        >
          <I18nProvider>
            {children}
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
