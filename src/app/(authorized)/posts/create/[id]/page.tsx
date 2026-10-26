import { notFound } from "next/navigation";

import PostForm from "../../_components/post-form";
import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/src/services/users";

type Props = {
  params: Promise<{ id: string }>;
};

const EditPostPage = async ({ params }: Props) => {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }

  const post = await db.orm.public.Post.include("image", (image) =>
    image.select("id"),
  )
    .where({ id: postId })
    .first();

  if (!post || post.authorId !== user.id) {
    notFound();
  }

  return (
    <div className="mx-auto w-full md:max-w-lg">
      <PostForm
        initialPost={{
          id: post.id,
          title: post.title,
          content: post.content,
          itemUrl: post.itemUrl,
          imageUrl: post.imageUrl,
          imagePreviewUrl: post.image
            ? `/api/posts/${post.id}/image`
            : undefined,
        }}
      />
    </div>
  );
};

export default EditPostPage;
