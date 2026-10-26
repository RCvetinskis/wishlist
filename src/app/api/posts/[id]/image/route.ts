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

  const image = await db.sql.public.PostImage
    .select("contentType")
    .select(
      "encodedData",
      (fields, functions) =>
        functions.raw`encode(${fields.data}, 'base64')`.returns("pg/text@1"),
    )
    .where((fields, functions) => functions.eq(fields.postId, postId))
    .build();
  const [imageRow] = await db.query(image);

  if (!imageRow) {
    return new Response("Image not found", { status: 404 });
  }

  const bytes = Buffer.from(imageRow.encodedData, "base64");
  const body = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(body).set(bytes);

  return new Response(body, {
    headers: {
      "Content-Type": imageRow.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
