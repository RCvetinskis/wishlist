import { or } from "@prisma/orm-postgres/orm-client";

import { db } from "../prisma/db";
import { getCurrentUser } from "./users";

export const POSTS_PER_PAGE = 20;
const MAX_SEARCH_LENGTH = 100;

export async function getPosts(
  page = 1,
  search = "",
  reservedByUserId?: number,
) {
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const query = search.trim().slice(0, MAX_SEARCH_LENGTH);

  let collection = db.orm.public.Post;
  if (reservedByUserId !== undefined) {
    collection = collection.where({ reservedById: reservedByUserId });
  }
  if (query) {
    const pattern = `%${query}%`;
    collection = collection.where((post) =>
      or(post.title.ilike(pattern), post.content.ilike(pattern)),
    );
  }

  const results = await collection
    .include("image", (image) => image.select("id"))
    .include("author")
    .orderBy([
      (post) => post.reservedById.desc(),
      (post) => post.createdAt.desc(),
    ])
    .limit(POSTS_PER_PAGE + 1)
    .offset((safePage - 1) * POSTS_PER_PAGE)
    .all();

  return {
    posts: results.slice(0, POSTS_PER_PAGE),
    hasMore: results.length > POSTS_PER_PAGE,
  };
}
export async function getCurrentUserPosts(page = 1, search = "") {
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const query = search.trim().slice(0, MAX_SEARCH_LENGTH);
  const user = await getCurrentUser();
  let collection = db.orm.public.Post.where({ authorId: user?.id });
  if (query) {
    const pattern = `%${query}%`;
    collection = collection.where((post) =>
      or(post.title.ilike(pattern), post.content.ilike(pattern)),
    );
  }

  const results = await collection
    .include("image", (image) => image.select("id"))
    .include("author")
    .orderBy([
      (post) => post.reservedById.desc(),
      (post) => post.createdAt.desc(),
    ])
    .limit(POSTS_PER_PAGE + 1)
    .offset((safePage - 1) * POSTS_PER_PAGE)
    .all();

  return {
    posts: results.slice(0, POSTS_PER_PAGE),
    hasMore: results.length > POSTS_PER_PAGE,
  };
}
