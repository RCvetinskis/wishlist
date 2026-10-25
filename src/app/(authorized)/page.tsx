import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/src/services/users";
import { capitalize } from "@/src/utils/helpers";
import { LocalizedText } from "@/src/components/i18n";
import { getPosts } from "@/src/services/posts";
import PostsControls from "./posts/_components/posts-controls";
import PostCard from "@/src/components/post-card";
import { redirect } from "next/navigation";
type Props = {
  searchParams: Promise<{
    page?: string | string[];
    search?: string | string[];
  }>;
};
const HomePage = async ({ searchParams }: Props) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth");
  }

  const params = await searchParams;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const rawSearch = Array.isArray(params.search)
    ? params.search[0]
    : params.search;
  const parsedPage = Number(rawPage);
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const search = rawSearch?.trim().slice(0, 100) ?? "";
  const { posts, hasMore } = await getPosts(page, search);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          <p>
            <LocalizedText
              message="welcome"
              values={{ name: capitalize(currentUser.username) }}
            />
          </p>
        </CardTitle>
        <CardDescription>
          <LocalizedText message="homeDescription" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <PostsControls search={search} page={page} hasMore={hasMore} />
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 2xl:grid-cols-4">
            {posts.map((item) => (
              <PostCard
                key={item.id}
                post={item}
                currentUserId={currentUser.id}
                isOwner={currentUser.status === "owner"}
              />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            <LocalizedText message={search ? "noSearchResults" : "noPosts"} />
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default HomePage;
