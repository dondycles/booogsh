import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
export const getPublicPosts = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    const userId = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", user?.tokenIdentifier!),
      )
      .unique();
    const posts = await ctx.db
      .query("posts")
      .filter((q) =>
        q.or(
          q.eq(q.field("privacy"), "public"),
          q.eq(q.field("userId"), userId?._id),
        ),
      )
      .order("desc")
      .collect();

    return Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        return {
          ...post,
          user,
        };
      }),
    );
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

    const userId = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", user.tokenIdentifier),
      )
      .unique();

    if (!userId) {
      throw new Error("No user found with the provided token identifier.");
    }

    return await ctx.db.insert("posts", {
      message: args.message,
      privacy: args.privacy,
      userId: userId?._id,
    });
  },
});
