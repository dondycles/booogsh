import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const getPublicPostComments = query({
  args: { postId: v.id("posts"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { postId, paginationOpts }) => {
    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found.");
    }

    const user = await ctx.auth.getUserIdentity();

    const userDbData = user
      ? await ctx.db
          .query("users")
          .withIndex("by_token", (q) =>
            q.eq("tokenIdentifier", user.tokenIdentifier),
          )
          .unique()
      : null;

    if (userDbData?._id !== post.userId && post.privacy !== "public") {
      throw new Error("You are not authorized to see comments on this post.");
    }

    const results = await ctx.db
      .query("comments")
      .withIndex("byPost", (q) => q.eq("postId", postId))
      .order("desc")
      .paginate(paginationOpts);

    const mappedPage = await Promise.all(
      results.page.map(async (comment) => {
        const commenter = await ctx.db.get(comment.userId);
        const isMyComment = userDbData
          ? userDbData._id === comment.userId
          : false;
        const isLiked = userDbData
          ? await ctx.db
              .query("commentLikes")
              .withIndex("byCommentAndUser", (q) =>
                q.eq("commentId", comment._id).eq("userId", userDbData._id),
              )
              .first()
          : null;

        return {
          ...comment,
          user: commenter,
          isMyComment,
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

export const add = mutation({
  args: { postId: v.id("posts"), content: v.string() },
  handler: async (ctx, { postId, content }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return "You must be signed in to like a post.";
    }

    const userDbData = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", user.tokenIdentifier),
      )
      .unique();

    if (!userDbData) {
      return "No user found with the provided token identifier.";
    }

    const post = await ctx.db.get(postId);
    if (!post) {
      return "Post not found.";
    }

    if (post.privacy !== "public" && post.userId !== userDbData._id) {
      return "You are not authorized to comment on this post.";
    }

    await ctx.db.patch(post._id, {
      commentsCount: post.commentsCount ? post.commentsCount + 1 : 1,
    });

    const res = await ctx.db.insert("comments", {
      content: content,
      postId: postId,
      userId: userDbData._id,
    });

    if (!res) {
      return "Failed to add comment.";
    }
    return true;
  },
});

export const remove = mutation({
  args: { commentId: v.id("comments"), postId: v.id("posts") },
  handler: async (ctx, { commentId, postId }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return "You must be signed in to remove a comment.";
    }

    const userDbData = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", user.tokenIdentifier),
      )
      .unique();

    if (!userDbData) {
      return "No user found with the provided token identifier.";
    }

    const comment = await ctx.db.get(commentId);
    if (!comment) {
      return "Comment not found.";
    }

    const post = await ctx.db.get(postId);
    if (!post) {
      return "Post not found.";
    }

    if (comment.userId !== userDbData._id && post.userId !== userDbData._id) {
      return "You are not authorized to delete this comment.";
    }

    await ctx.db.patch(post._id, {
      commentsCount: post.commentsCount ? post.commentsCount - 1 : 0,
    });

    await ctx.db.delete(commentId);

    return true;
  },
});
