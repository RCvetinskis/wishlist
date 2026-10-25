import PostCard from "@/src/components/post-card";
import { getCurrentUserPosts } from "@/src/services/posts";
import { getCurrentUser } from "@/src/services/users";
import { LocalizedText } from "@/src/components/i18n";
import PostsControls from "./_components/posts-controls";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    page?: string | string[];
    search?: string | string[];
  }>;
};

const PostsPage = async ({ searchParams }: Props) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/auth");
  }
  if (currentUser.status !== "owner") {
    redirect("/");
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
  const { posts, hasMore } = await getCurrentUserPosts(page, search);

  return (
    <div className="space-y-5">
      <PostsControls search={search} page={page} hasMore={hasMore} />
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 2xl:grid-cols-4">
          {posts.map((item) => (
            <PostCard
              key={item.id}
              post={item}
              currentUserId={currentUser.id}
              isOwner
            />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-muted-foreground">
          <LocalizedText message={search ? "noSearchResults" : "noPosts"} />
        </p>
      )}
    </div>
  );
};

export default PostsPage;
