import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import { I18nProvider } from "@/src/components/i18n";
import { ThemeProvider } from "@/src/components/theme-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Wishlist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="lt"
      className={cn("font-sans", geist.variable)}
    >
      <head>
        <Script id="initialize-theme" strategy="beforeInteractive">
          {`(() => {
            const savedTheme = localStorage.getItem("wishlist-theme");
            const theme =
              savedTheme === "dark" || savedTheme === "light"
                ? savedTheme
                : window.matchMedia("(prefers-color-scheme: dark)").matches
                  ? "dark"
                  : "light";
            document.documentElement.classList.toggle("dark", theme === "dark");
          })();`}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <I18nProvider>
            {children}
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
