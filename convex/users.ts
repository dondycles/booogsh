import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const checkAndGetCurrentUser = mutation({
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
			throw new ConvexError("Called storeUser without authentication present");
		}

		const currentUserDbData = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", identity.tokenIdentifier),
			)
			.unique();

		if (currentUserDbData !== null) {
			if (name !== currentUserDbData.name) {
				await ctx.db.patch(currentUserDbData._id, { name });
			}
			if (email !== currentUserDbData.email) {
				await ctx.db.patch(currentUserDbData._id, { email });
			}
			if (username !== currentUserDbData.username) {
				await ctx.db.patch(currentUserDbData._id, { username });
			}
			if (pfp !== currentUserDbData.pfp) {
				await ctx.db.patch(currentUserDbData._id, { pfp: identity.pictureUrl });
			}
			return currentUserDbData;
		}

		const newUserId = await ctx.db.insert("users", {
			name,
			email,
			username,
			tokenIdentifier: identity.tokenIdentifier,
			pfp: identity.pictureUrl,
			activityStatus: "visible",
			lastActivity: new Date().toISOString(),
		});
		return await ctx.db
			.query("users")
			.withIndex("by_id", (q) => q.eq("_id", newUserId))
			.unique();
	},
});

export const getUserProfile = query({
	args: {
		username: v.string(),
	},
	handler: async (ctx, { username }) => {
		return await ctx.db
			.query("users")
			.withIndex("by_username", (q) => q.eq("username", username))
			.unique();
	},
});

export const toggleUserActivityStatus = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError("You must be signed in to set user activity.");
		}
		const currentUserDbData = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", identity.tokenIdentifier),
			)
			.unique();

		if (!currentUserDbData) {
			throw new ConvexError("Current user can not be found.");
		}

		await ctx.db.patch(currentUserDbData._id, {
			activityStatus:
				currentUserDbData.activityStatus === "hidden" ? "visible" : "hidden",
		});
	},
});

export const updateLastActivity = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();

		const currentUserDbData = identity
			? await ctx.db
					.query("users")
					.withIndex("by_token", (q) =>
						q.eq("tokenIdentifier", identity.tokenIdentifier),
					)
					.unique()
			: null;

		if (!currentUserDbData) return;

		await ctx.db.patch(currentUserDbData._id, {
			lastActivity: new Date().toISOString(),
		});
	},
});
