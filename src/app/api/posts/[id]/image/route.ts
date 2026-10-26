import { db } from "@/src/prisma/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
