import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/src/services/users";
import { capitalize } from "@/src/utils/helpers";
import { getPosts } from "@/src/services/posts";
import PostsControls from "./posts/_components/posts-controls";
import PostsList from "@/src/components/posts-list";
import Hero from "@/src/components/hero";
import { redirect } from "next/navigation";
type Props = {
  searchParams: Promise<{
    page?: string | string[];
    search?: string | string[];
    reservedByMe?: string | string[];
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
  const rawReservedByMe = Array.isArray(params.reservedByMe)
    ? params.reservedByMe[0]
    : params.reservedByMe;
  const parsedPage = Number(rawPage);
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const search = rawSearch?.trim().slice(0, 100) ?? "";
  const reservedByMe = rawReservedByMe === "true";

  const { posts, hasMore } = await getPosts(
    page,
    search,
    reservedByMe ? currentUser.id : undefined,
  );

  return (
    <>
      <Hero name={capitalize(currentUser.username)} />
      <Card className="bg-transparent p-0">
        <CardContent className="space-y-5 my-2 px-1">
          <PostsControls
            search={search}
            page={page}
            hasMore={hasMore}
            basePath="/"
            reservedByMe={reservedByMe}
            showReservationFilter
          />
          <PostsList
            posts={posts}
            currentUserId={currentUser.id}
            isOwner={currentUser.status === "owner"}
            search={search}
            reservedByMe={reservedByMe}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default HomePage;
