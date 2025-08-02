import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const toggleLikePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
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

    if (post.privacy === "private" && post.userId !== userDbData._id) {
      return "You are not authorized to like this post.";
    }

    const like = await ctx.db
      .query("postLikes")
      .withIndex("byPostAndUser", (q) =>
        q.eq("postId", postId).eq("userId", userDbData._id),
      )
      .unique();

    if (like) {
      await ctx.db.patch(post._id, {
        likesCount: post.likesCount ? post.likesCount - 1 : 0,
      });
      await ctx.db.delete(like._id);
    } else {
      await ctx.db.patch(post._id, {
        likesCount: post.likesCount ? post.likesCount + 1 : 1,
      });
      await ctx.db.insert("postLikes", {
        postId,
        userId: userDbData._id,
      });
    }
    return true;
  },
});

export const toggleLikeComment = mutation({
  args: { commentId: v.id("postComments") },
  handler: async (ctx, { commentId }) => {
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

    const comment = await ctx.db.get(commentId);

    if (!comment) {
      return "Comment not found.";
    }

    const like = await ctx.db
      .query("postCommentLikes")
      .withIndex("byCommentAndUser", (q) =>
        q.eq("commentId", commentId).eq("userId", userDbData._id),
      )
      .unique();

    if (like) {
      await ctx.db.patch(comment._id, {
        likesCount: comment.likesCount ? comment.likesCount - 1 : 0,
      });
      await ctx.db.delete(like._id);
    } else {
      await ctx.db.patch(comment._id, {
        likesCount: comment.likesCount ? comment.likesCount + 1 : 1,
      });
      await ctx.db.insert("postCommentLikes", {
        commentId,
        userId: userDbData._id,
      });
    }
    return true;
  },
});
