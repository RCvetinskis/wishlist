import { Card } from "@/components/ui/card";
import { LocalizedText } from "@/src/components/i18n";

type Props = {
  showHero?: boolean;
};

function SkeletonBlock({ className }: { className: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function PostsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <Card key={index} className="overflow-hidden bg-transparent">
          <SkeletonBlock className="aspect-4/3 w-full rounded-none" />
          <div className="space-y-2 p-4">
            <SkeletonBlock className="h-5 w-3/4" />
            <SkeletonBlock className="h-4 w-1/3" />
            <SkeletonBlock className="mt-4 h-16 w-full" />
            <SkeletonBlock className="mt-4 h-9 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function PostsPageSkeleton({ showHero = false }: Props) {
  const content = (
    <>
      <div className="space-y-4 pt-2">
        <div className="flex gap-2">
          <SkeletonBlock className="h-10 flex-1" />
          <SkeletonBlock className="h-10 w-24" />
        </div>
      </div>
      <PostsGridSkeleton />
    </>
  );

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">
        <LocalizedText message="loading" />
      </span>
      {showHero && (
        <div className="mb-6 grid min-h-64 animate-pulse overflow-hidden rounded-2xl border bg-card shadow-sm md:grid-cols-[1fr_0.8fr] sm:min-h-80 md:min-h-96">
          <div className="flex flex-col justify-center space-y-4 px-6 py-8 sm:px-10 sm:py-12">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-10 w-3/4 max-w-md" />
            <SkeletonBlock className="h-16 w-full max-w-xl" />
          </div>
          <SkeletonBlock className="hidden h-full rounded-none md:block" />
        </div>
      )}
      {showHero ? (
        <Card className="bg-transparent">
          <div className="space-y-5 px-4 py-6">{content}</div>
        </Card>
      ) : (
        <div className="space-y-5">{content}</div>
      )}
    </div>
  );
}
