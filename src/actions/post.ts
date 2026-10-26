"use server";

import { revalidatePath } from "next/cache";
import { db } from "../prisma/db";
import { getCurrentUser } from "../services/users";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export type CreatePostParams = {
  title: string;
  content?: string;
  itemUrl?: string;
  imageUrl?: string;
  imageFile?: File;
};
export type CreatePostResult =
  | {
      success: true;
      post: {
        id: number;
        title: string;
      };
    }
  | {
      success: false;
      error: string;
    };

export async function CreatePost(
  params: CreatePostParams,
): Promise<CreatePostResult> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to create a wishlist item.",
      };
    }

    if (user.status != "owner") {
      return {
        success: false,
        error: "You must be owner to create a wishlist item.",
      };
    }

    const title = params.title.trim();
    const content = params.content?.trim() || null;
    const itemUrl = params.itemUrl?.trim() || null;
    const imageUrl = params.imageUrl?.trim() || null;

    if (!title) {
      return { success: false, error: "Item title is required." };
    }

    if (title.length > 200) {
      return {
        success: false,
        error: "Title must be 200 characters or fewer.",
      };
    }

    for (const [field, value] of [
      ["Product URL", itemUrl],
      ["Image URL", imageUrl],
    ] as const) {
      if (value) {
        try {
          const url = new URL(value);

          if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("Invalid protocol");
          }
        } catch {
          return {
            success: false,
            error: `${field} must be a valid HTTP or HTTPS URL.`,
          };
        }
      }
    }

    const post = await db.orm.public.Post.create({
      title,
      content,
      itemUrl,
      imageUrl,
      authorId: user.id,
    });

    if (params.imageFile) {
      const uploadResult = await UploadPostImage(post.id, params.imageFile);

      if (!uploadResult.success) {
        return uploadResult;
      }
    }
    revalidatePath("/posts");

    return {
      success: true,
      post: {
        id: post.id,
        title: post.title,
      },
    };
  } catch (error) {
    console.error("CreatePost failed:", error);

    return {
      success: false,
      error: "Unable to create the wishlist item. Please try again.",
    };
  }
}

export type UpdatePostParams = CreatePostParams & {
  imageChanged: boolean;
};

export type UpdatePostResult =
  | { success: true }
  | { success: false; error: string };

export async function UpdatePost(
  postId: number,
  params: UpdatePostParams,
): Promise<UpdatePostResult> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: "You must be logged in to edit a post." };
    }

    if (user.status !== "owner") {
      return { success: false, error: "Only the owner can edit wishlist items." };
    }

    if (!Number.isInteger(postId) || postId <= 0) {
      return { success: false, error: "Invalid wishlist item." };
    }

    const title = params.title.trim();
    const content = params.content?.trim() || null;
    const itemUrl = params.itemUrl?.trim() || null;
    const imageUrl = params.imageUrl?.trim() || null;

    if (!title) {
      return { success: false, error: "Item title is required." };
    }

    if (title.length > 200) {
      return {
        success: false,
        error: "Title must be 200 characters or fewer.",
      };
    }

    for (const [field, value] of [
      ["Product URL", itemUrl],
      ["Image URL", imageUrl],
    ] as const) {
      if (value) {
        try {
          const url = new URL(value);

          if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("Invalid protocol");
          }
        } catch {
          return {
            success: false,
            error: `${field} must be a valid HTTP or HTTPS URL.`,
          };
        }
      }
    }

    let imageData: Uint8Array | undefined;
    if (params.imageFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(params.imageFile.type)) {
        return {
          success: false,
          error: "Please select a JPEG, PNG, WebP, HEIC, or HEIF image.",
        };
      }

      if (
        params.imageFile.size === 0 ||
        params.imageFile.size > MAX_IMAGE_SIZE
      ) {
        return {
          success: false,
          error: "Image must be 20 MB or smaller.",
        };
      }

      imageData = new Uint8Array(await params.imageFile.arrayBuffer());
    }

    const updated = await db.transaction(async (tx) => {
      const post = await tx.orm.public.Post.where({
        id: postId,
        authorId: user.id,
      }).update({
        title,
        content,
        itemUrl,
        ...(params.imageChanged ? { imageUrl } : {}),
      });

      if (!post) {
        return false;
      }

      if (params.imageChanged) {
        await tx.orm.public.PostImage.where({ postId }).delete();

        if (imageData && params.imageFile) {
          await tx.orm.public.PostImage.select("id").create({
            postId,
            data: imageData,
            contentType: params.imageFile.type,
          });
        }
      }

      return true;
    });

    if (!updated) {
      return {
        success: false,
        error: "Post not found or you are not authorized to edit it.",
      };
    }

    revalidatePath("/posts");
    revalidatePath(`/posts/create/${postId}`);
    return { success: true };
  } catch (error) {
    console.error("UpdatePost failed:", error);

    return {
      success: false,
      error: "Unable to update the wishlist item. Please try again.",
    };
  }
}

export type UploadPostImageResult =
  { success: true } | { success: false; error: string };

export async function UploadPostImage(
  postId: number,
  file: File,
): Promise<UploadPostImageResult> {
  try {
    const user = await getCurrentUser();

    if (!user || user.status !== "owner") {
      return {
        success: false,
        error: "You are not authorized to upload images.",
      };
    }

    if (!Number.isInteger(postId) || postId <= 0) {
      return { success: false, error: "Invalid wishlist item." };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Please select a JPEG, PNG, WebP, HEIC, or HEIF image.",
      };
    }

    if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
      return {
        success: false,
        error: "Image must be 20 MB or smaller.",
      };
    }

    const imageData = new Uint8Array(await file.arrayBuffer());

    await db.orm.public.PostImage.select("id").create({
      postId,
      data: imageData,
      contentType: file.type,
    });

    revalidatePath("/posts");

    return { success: true };
  } catch (error) {
    console.error("UploadPostImage failed:", error);

    return {
      success: false,
      error: "Unable to upload the image. Please try again.",
    };
  }
}

export async function ReservePost(postId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to create a wishlist item.",
      };
    }

    const post = await db.orm.public.Post.where({ id: postId }).update({
      reservedById: user.id,
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }
    revalidatePath("/posts");
    return {
      success: true,
      post,
    };
  } catch (error) {
    return {
      success: false,
      error: "Unable to reserve",
    };
  }
}

export async function UnreserverPost(postId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to create a wishlist item.",
      };
    }

    const post = await db.orm.public.Post.where({
      id: postId,
      reservedById: user.id,
    }).update({
      reservedById: null,
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }
    revalidatePath("/posts");
    return {
      success: true,
      post,
    };
  } catch (error) {
    return {
      success: false,
      error: "Unable to reserve",
    };
  }
}

export type DeletePostResult =
  | { success: true }
  | { success: false; error: string };

export async function DeletePost(postId: number): Promise<DeletePostResult> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: "You must be logged in to delete a post." };
    }

    if (user.status !== "owner") {
      return { success: false, error: "Only the owner can delete wishlist items." };
    }

    if (!Number.isInteger(postId) || postId <= 0) {
      return { success: false, error: "Invalid wishlist item." };
    }

    const post = await db.orm.public.Post.where({
      id: postId,
      authorId: user.id,
    }).delete();

    if (!post) {
      return {
        success: false,
        error: "Post not found or you are not authorized to delete it.",
      };
    }

    revalidatePath("/posts");
    return { success: true };
  } catch (error) {
    console.error("DeletePost failed:", error);

    return {
      success: false,
      error: "Unable to delete the wishlist item. Please try again.",
    };
  }
}
