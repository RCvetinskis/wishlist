"use client";
import Image from "next/image";
import { LocalizedText, useI18n } from "@/src/components/i18n";

type HeroProps = {
  name: string;
};

export default function Hero({ name }: HeroProps) {
  const { t } = useI18n();

  return (
    <section className="mb-6 grid overflow-hidden rounded-2xl border bg-card shadow-sm md:grid-cols-[1fr_0.8fr]">
      <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Wishlist
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">
          <LocalizedText message="welcome" values={{ name }} />
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
          <LocalizedText message="homeDescription" />
        </p>
      </div>

      <div className="relative min-h-64 sm:min-h-80 md:min-h-96">
        <Image
          src="/images/hero.jpeg"
          alt={t("heroImageAlt")}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover object-[center_38%]"
        />
      </div>
    </section>
  );
}
