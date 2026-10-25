import { LocalizedText } from "@/src/components/i18n";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-4 text-center"
      >
        <span
          aria-hidden="true"
          className="size-10 animate-spin rounded-full border-4 border-muted border-t-primary"
        />
        <p className="text-sm font-medium text-muted-foreground">
          <LocalizedText message="loading" />
        </p>
      </div>
    </div>
  );
}
