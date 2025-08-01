import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const getPublicPosts = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    const userDbData = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", user?.tokenIdentifier!),
      )
      .unique();
    const results = await ctx.db
      .query("posts")
      .filter((q) =>
        q.or(
          q.eq(q.field("privacy"), "public"),
          q.eq(q.field("userId"), userDbData?._id),
        ),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    const mappedPage = await Promise.all(
      results.page.map(async (post) => {
        const user = await ctx.db.get(post.userId);

        const isLiked = userDbData
          ? await ctx.db
              .query("likes")
              .withIndex("byPostAndUser", (q) =>
                q.eq("postId", post._id).eq("userId", userDbData._id),
              )
              .unique()
          : null;

        return {
          ...post,
          user,
          isLiked: !!isLiked,
        };
      }),
    );

    return {
      ...results,
      page: mappedPage,
    };
  },
});

export const getPublicPostComments = query({
  args: { postId: v.id("posts"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { postId, paginationOpts }) => {
    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found.");
    }

    if (post.privacy !== "public") {
      throw new Error("This post is not public.");
    }

    const results = await ctx.db
      .query("comments")
      .withIndex("byPost", (q) => q.eq("postId", postId))
      .order("desc")
      .paginate(paginationOpts);

    const mappedPage = await Promise.all(
      results.page.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user,
        };
      }),
    );

    return {
      ...results,
      page: mappedPage,
    };
  },
});

export const getMyPosts = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("You must be signed in to get your posts.");
    }

    return await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
  },
});

export const add = mutation({
  args: {
    message: v.string(),
    privacy: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("friends"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("You must be signed to post.");
    }

    const userDbData = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", user.tokenIdentifier),
      )
      .unique();

    if (!userDbData) {
      throw new Error("No user found with the provided token identifier.");
    }

    return await ctx.db.insert("posts", {
      message: args.message,
      privacy: args.privacy,
      userId: userDbData?._id,
    });
  },
});

export const remove = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("You must be signed in to like a post.");
    }

    const userDbData = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", user.tokenIdentifier),
      )
      .unique();

    if (!userDbData) {
      throw new Error("No user found with the provided token identifier.");
    }

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found.");
    }

    if (post.userId !== userDbData._id) {
      throw new Error("You are not authorized to delete this post.");
    }

    // Remove all likes associated with the post
    const likes = await ctx.db
      .query("likes")
      .withIndex("byPost", (q) => q.eq("postId", postId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // Remove all comments associated with the post
    const comments = await ctx.db
      .query("comments")
      .withIndex("byPost", (q) => q.eq("postId", postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }
    // Finally, delete the post itself
    return await ctx.db.delete(postId);
  },
});

export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("You must be signed in to like a post.");
    }

    const userDbData = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", user.tokenIdentifier),
      )
      .unique();

    if (!userDbData) {
      throw new Error("No user found with the provided token identifier.");
    }

    const post = await ctx.db.get(postId);

    if (!post) {
      throw new Error("Post not found.");
    }

    const like = await ctx.db
      .query("likes")
      .withIndex("byPostAndUser", (q) =>
        q.eq("postId", postId).eq("userId", userDbData._id),
      )
      .unique();

    if (like) {
      await ctx.db.patch(post._id, {
        likesCount: post.likesCount ? post.likesCount - 1 : 0,
      });
      return await ctx.db.delete(like._id);
    } else {
      await ctx.db.patch(post._id, {
        likesCount: post.likesCount ? post.likesCount + 1 : 1,
      });
      return await ctx.db.insert("likes", {
        postId,
        userId: userDbData._id,
      });
    }
  },
});

export const addComment = mutation({
  args: { postId: v.id("posts"), content: v.string() },
  handler: async (ctx, { postId, content }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("You must be signed in to like a post.");
    }

    const userDbData = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", user.tokenIdentifier),
      )
      .unique();

    if (!userDbData) {
      throw new Error("No user found with the provided token identifier.");
    }

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found.");
    }

    await ctx.db.patch(post._id, {
      commentsCount: post.commentsCount ? post.commentsCount + 1 : 1,
    });

    return await ctx.db.insert("comments", {
      content: content,
      postId: postId,
      userId: userDbData._id,
    });
  },
});

export const removeComment = mutation({
  args: { commentId: v.id("comments"), postId: v.id("posts") },
  handler: async (ctx, { commentId, postId }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("You must be signed in to remove a comment.");
    }

    const userDbData = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", user.tokenIdentifier),
      )
      .unique();

    if (!userDbData) {
      throw new Error("No user found with the provided token identifier.");
    }

    const comment = await ctx.db.get(commentId);
    if (!comment) {
      throw new Error("Comment not found.");
    }

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found.");
    }
    if (comment.userId !== userDbData._id) {
      throw new Error("You are not authorized to delete this comment.");
    }

    if (post.userId !== userDbData._id) {
      throw new Error(
        "You are not authorized to delete comments on this post.",
      );
    }

    await ctx.db.patch(post._id, {
      commentsCount: post.commentsCount ? post.commentsCount - 1 : 0,
    });

    return await ctx.db.delete(commentId);
  },
});
