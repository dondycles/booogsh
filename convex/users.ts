import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const checkAndGetUser = mutation({
  args: {
    info: v.object({
      name: v.string(),
      email: v.string(),
      username: v.string(),
      pfp: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { info: { email, name, username, pfp } }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    const userDbData = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (userDbData !== null) {
      if (name !== userDbData.name) {
        await ctx.db.patch(userDbData._id, { name });
      }
      if (email !== userDbData.email) {
        await ctx.db.patch(userDbData._id, { email });
      }
      if (username !== userDbData.username) {
        await ctx.db.patch(userDbData._id, { username });
      }
      if (pfp !== userDbData.pfp) {
        await ctx.db.patch(userDbData._id, { pfp: identity.pictureUrl });
      }
      return userDbData;
    }

    const newUserId = await ctx.db.insert("users", {
      name,
      email,
      username,
      tokenIdentifier: identity.tokenIdentifier,
      pfp: identity.pictureUrl,
    });
    return await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", newUserId))
      .unique();
  },
});

export const authCheck = query({
  args: {},
  handler: async (ctx) => {
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
    return userDbData;
  },
});
