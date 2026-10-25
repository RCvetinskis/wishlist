import { db } from "@/src/prisma/db";
import { getCurrentUser } from "@/src/services/users";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) {
    return new Response("Invalid post ID", { status: 400 });
  }

  const image = await db.orm.public.PostImage.where({ postId }).first();

  if (!image) {
    return new Response("Image not found", { status: 404 });
  }

  const body = new Uint8Array(image.data).buffer;

  return new Response(body, {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
