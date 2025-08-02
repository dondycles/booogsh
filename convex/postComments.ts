import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const getPublicPostComments = query({
  args: {
    postId: v.id("posts"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { postId, paginationOpts }) => {
    const user = await ctx.auth.getUserIdentity();
    const userDbData = user
      ? await ctx.db
          .query("users")
          .withIndex("by_token", (q) =>
            q.eq("tokenIdentifier", user.tokenIdentifier),
          )
          .unique()
      : null;
    const post = await ctx.db.get(postId);

    if (!post) {
      throw new Error("Post not found.");
    }

    if (userDbData?._id !== post.userId && post.privacy !== "public") {
      throw new Error("You are not authorized to see comments on this post.");
    }

    const results = await ctx.db
      .query("postComments")
      .withIndex("byCommentAndPost", (q) =>
        q.eq("commentId", undefined).eq("postId", postId),
      )
      .order("desc")
      .paginate(paginationOpts);

    const mappedPage = await Promise.all(
      results.page.map(async (comment) => {
        const commenter = await ctx.db.get(comment.userId);
        const isMyPost = userDbData ? userDbData._id === post.userId : false;
        const isMyComment = userDbData
          ? userDbData._id === comment.userId
          : false;
        const isLiked = userDbData
          ? await ctx.db
              .query("postCommentLikes")
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
          isMyPost: !!isMyPost,
        };
      }),
    );

    return {
      ...results,
      page: mappedPage,
    };
  },
});

export const getChildComments = query({
  args: {
    postId: v.id("posts"),
    commentId: v.id("postComments"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { commentId, postId, paginationOpts }) => {
    const user = await ctx.auth.getUserIdentity();
    const userDbData = user
      ? await ctx.db
          .query("users")
          .withIndex("by_token", (q) =>
            q.eq("tokenIdentifier", user.tokenIdentifier),
          )
          .unique()
      : null;

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found.");
    }

    if (userDbData?._id !== post.userId && post.privacy !== "public") {
      throw new Error("You are not authorized to see comments on this post.");
    }

    const parentComment = await ctx.db.get(commentId);
    if (!parentComment) {
      throw new Error("Parent comment not found.");
    }

    const results = await ctx.db
      .query("postComments")
      .withIndex("byCommentAndPost", (q) =>
        q.eq("commentId", commentId).eq("postId", postId),
      )
      .order("desc")
      .paginate(paginationOpts);

    const mappedPage = await Promise.all(
      results.page.map(async (comment) => {
        const commenter = await ctx.db.get(comment.userId);
        const isMyPost = userDbData ? userDbData._id === post.userId : false;
        const isMyComment = userDbData
          ? userDbData._id === comment.userId
          : false;
        const isLiked = userDbData
          ? await ctx.db
              .query("postCommentLikes")
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
          isMyPost: !!isMyPost,
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
  args: {
    postId: v.id("posts"),
    commentId: v.optional(v.id("postComments")),
    content: v.string(),
  },
  handler: async (ctx, { postId, content, commentId }) => {
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

    const res = await ctx.db.insert("postComments", {
      content: content,
      postId: postId,
      userId: userDbData._id,
      commentId,
    });

    if (!res) {
      return "Failed to add comment.";
    }
    return true;
  },
});

export const remove = mutation({
  args: { commentId: v.id("postComments"), postId: v.id("posts") },
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

    const childrenComments = await ctx.db
      .query("postComments")
      .withIndex("byComment", (q) => q.eq("commentId", commentId))
      .collect();

    if (childrenComments.length > 0) {
      await Promise.all(
        childrenComments.map(async (childComment) => {
          await ctx.db.delete(childComment._id);
        }),
      );
    }

    await ctx.db.patch(post._id, {
      commentsCount: post.commentsCount
        ? childrenComments.length > 0
          ? post.commentsCount - (childrenComments.length + 1)
          : post.commentsCount - 1
        : 0,
    });
    await ctx.db.delete(commentId);

    return true;
  },
});
