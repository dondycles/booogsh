import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const getPublicPostComments = query({
  args: {
    postId: v.id("posts"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { postId, paginationOpts }) => {
    const currentUser = await ctx.auth.getUserIdentity();
    const currentUserDbData = currentUser
      ? await ctx.db
          .query("users")
          .withIndex("by_token", (q) =>
            q.eq("tokenIdentifier", currentUser.tokenIdentifier),
          )
          .unique()
      : null;
    const post = await ctx.db.get(postId);

    if (!post) {
      throw new ConvexError("Post not found.");
    }

    if (currentUserDbData?._id !== post.userId && post.privacy !== "public") {
      throw new ConvexError(
        "You are not authorized to see comments on this post.",
      );
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
        const isMyPost = currentUserDbData
          ? currentUserDbData._id === post.userId
          : false;
        const isMyComment = currentUserDbData
          ? currentUserDbData._id === comment.userId
          : false;
        const isLiked = currentUserDbData
          ? await ctx.db
              .query("postCommentLikes")
              .withIndex("byCommentAndUser", (q) =>
                q
                  .eq("commentId", comment._id)
                  .eq("userId", currentUserDbData._id),
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
    const currentUser = await ctx.auth.getUserIdentity();
    const currentUserDbData = currentUser
      ? await ctx.db
          .query("users")
          .withIndex("by_token", (q) =>
            q.eq("tokenIdentifier", currentUser.tokenIdentifier),
          )
          .unique()
      : null;

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new ConvexError("Post not found.");
    }

    if (currentUserDbData?._id !== post.userId && post.privacy !== "public") {
      throw new ConvexError(
        "You are not authorized to see comments on this post.",
      );
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
        const isMyPost = currentUserDbData
          ? currentUserDbData._id === post.userId
          : false;
        const isMyComment = currentUserDbData
          ? currentUserDbData._id === comment.userId
          : false;
        const isLiked = currentUserDbData
          ? await ctx.db
              .query("postCommentLikes")
              .withIndex("byCommentAndUser", (q) =>
                q
                  .eq("commentId", comment._id)
                  .eq("userId", currentUserDbData._id),
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
    const currentUser = await ctx.auth.getUserIdentity();
    if (!currentUser) {
      throw new ConvexError("You must be signed in to like a post.");
    }

    const currentUserDbData = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", currentUser.tokenIdentifier),
      )
      .unique();

    if (!currentUserDbData) {
      throw new ConvexError(
        "Current user can not be found with the provided token identifier.",
      );
    }

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new ConvexError("Post not found.");
    }

    if (post.privacy !== "public" && post.userId !== currentUserDbData._id) {
      throw new ConvexError("You are not authorized to comment on this post.");
    }

    await ctx.db.patch(post._id, {
      commentsCount: post.commentsCount ? post.commentsCount + 1 : 1,
    });

    if (commentId) {
      const parentComment = await ctx.db.get(commentId);
      if (parentComment) {
        await ctx.db.patch(commentId, {
          commentsCount: parentComment.commentsCount
            ? parentComment.commentsCount + 1
            : 1,
        });
      }
    }
    await ctx.db.insert("postComments", {
      content: content,
      postId: postId,
      userId: currentUserDbData._id,
      commentId,
    });
  },
});

export const remove = mutation({
  args: {
    commentId: v.id("postComments"),
    postId: v.id("posts"),
    parentCommentId: v.optional(v.id("postComments")),
  },
  handler: async (ctx, { commentId, postId, parentCommentId }) => {
    const currentUser = await ctx.auth.getUserIdentity();
    if (!currentUser)
      throw new ConvexError("You must be signed in to remove a comment.");

    const currentUserDbData = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", currentUser.tokenIdentifier),
      )
      .unique();
    if (!currentUserDbData)
      throw new ConvexError(
        "Current user can not be found with the provided token identifier.",
      );

    const comment = await ctx.db.get(commentId);
    if (!comment) throw new ConvexError("Comment not found.");

    const post = await ctx.db.get(postId);
    if (!post) throw new ConvexError("Post not found.");

    if (
      comment.userId !== currentUserDbData._id &&
      post.userId !== currentUserDbData._id
    ) {
      throw new ConvexError("You are not authorized to delete this comment.");
    }

    const descendants = await ctx.runQuery(
      api.postComments.getAllDescendantComments,
      {
        parentId: commentId,
      },
    );
    await Promise.all(descendants.flat().map((c) => ctx.db.delete(c._id)));

    const commentsLikes = await Promise.all(
      descendants.map((c) =>
        ctx.db
          .query("postCommentLikes")
          .withIndex("byComment", (q) => q.eq("commentId", c._id))
          .collect(),
      ),
    );
    await Promise.all(
      commentsLikes.flat().map((like) => ctx.db.delete(like._id)),
    );

    const parentCommentLike = await ctx.db
      .query("postCommentLikes")
      .withIndex("byComment", (q) => q.eq("commentId", commentId))
      .first();

    if (parentCommentLike) {
      await ctx.db.delete(parentCommentLike._id);
    }

    await ctx.db.delete(commentId);
    if (parentCommentId) {
      const parentComment = await ctx.db.get(parentCommentId);
      if (parentComment) {
        await ctx.db.patch(parentCommentId, {
          commentsCount: parentComment.commentsCount
            ? parentComment.commentsCount - 1
            : 0,
        });
      }
    }

    const totalDeleted = descendants.length + 1;
    await ctx.db.patch(post._id, {
      commentsCount: Math.max((post.commentsCount ?? 0) - totalDeleted, 0),
    });
  },
});

export const getAllDescendantComments = query({
  args: { parentId: v.id("postComments") },
  handler: async (ctx, { parentId }) => {
    const descendants: Doc<"postComments">[] = [];

    async function recurse(id: Id<"postComments">) {
      const children = await ctx.db
        .query("postComments")
        .withIndex("byComment", (q) => q.eq("commentId", id))
        .collect();

      for (const child of children) {
        descendants.push(child);
        await recurse(child._id);
      }
    }

    await recurse(parentId);
    return descendants;
  },
});

export const getAllDescendantCommentLikes = query({
  args: { parentId: v.id("postComments") },
  handler: async (ctx, { parentId }) => {
    const descendants: Doc<"postComments">[] = [];

    async function recurse(id: Id<"postComments">) {
      const children = await ctx.db
        .query("postComments")
        .withIndex("byComment", (q) => q.eq("commentId", id))
        .collect();

      for (const child of children) {
        descendants.push(child);
        await recurse(child._id);
      }
    }

    await recurse(parentId);
    return descendants;
  },
});
