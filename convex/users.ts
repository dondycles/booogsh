import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const checkAndGetUser = mutation({
  args: {
    info: v.object({
      name: v.string(),
      email: v.string(),
      username: v.string(),
    }),
  },
  handler: async (ctx, { info: { email, name, username } }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    const userData = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (userData !== null) {
      if (name !== userData.name) {
        await ctx.db.patch(userData._id, { name });
      }
      if (email !== userData.email) {
        await ctx.db.patch(userData._id, { email });
      }
      if (username !== userData.username) {
        await ctx.db.patch(userData._id, { username });
      }
      return userData;
    }

    const newUserId = await ctx.db.insert("users", {
      name,
      email,
      username,
      tokenIdentifier: identity.tokenIdentifier,
    });
    return await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", newUserId))
      .unique();
  },
});
