import PostsList from "@/src/components/posts-list";
import { getCurrentUserPosts } from "@/src/services/posts";
import { getCurrentUser } from "@/src/services/users";
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
      <PostsControls
        search={search}
        page={page}
        hasMore={hasMore}
        basePath="/posts"
      />
      <PostsList
        posts={posts}
        currentUserId={currentUser.id}
        isOwner
        search={search}
      />
    </div>
  );
};

export default PostsPage;
