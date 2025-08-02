import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const getPublicPosts = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    const userDbData = user
      ? await ctx.db
          .query("users")
          .withIndex("by_token", (q) =>
            q.eq("tokenIdentifier", user.tokenIdentifier),
          )
          .unique()
      : null;

    if (!userDbData) {
      const results = await ctx.db
        .query("posts")
        .filter((q) => q.eq(q.field("privacy"), "public"))
        .order("desc")
        .paginate(args.paginationOpts);

      const mappedPage = await Promise.all(
        results.page.map(async (post) => {
          const user = await ctx.db.get(post.userId);
          return {
            ...post,
            user,
            isLiked: false,
          };
        }),
      );

      return {
        ...results,
        page: mappedPage,
      };
    }

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
              .query("postLikes")
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

    if (post.userId !== userDbData._id) {
      return "You are not authorized to delete this post.";
    }

    const likes = await ctx.db
      .query("postLikes")
      .withIndex("byPost", (q) => q.eq("postId", postId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("byPost", (q) => q.eq("postId", postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    await ctx.db.delete(postId);

    return true;
  },
});
