import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggleFriendship = mutation({
	args: { targetUserId: v.id("users") },
	handler: async (ctx, args) => {
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

		const isExisting = await ctx.db
			.query("friends")
			.filter((q) =>
				q.or(
					q.and(
						q.eq(q.field("friendId"), currentUserDbData._id),
						q.eq(q.field("userId"), args.targetUserId),
					),
					q.and(
						q.eq(q.field("userId"), currentUserDbData._id),
						q.eq(q.field("friendId"), args.targetUserId),
					),
				),
			)
			.unique();

		if (isExisting && isExisting.status === "accepted") {
			throw new ConvexError("Already a friend.");
		}
		if (
			isExisting &&
			isExisting.status === "pending" &&
			isExisting.userId === currentUserDbData._id
		) {
			ctx.db.delete(isExisting._id);
			return;
		}

		if (
			isExisting &&
			isExisting.status === "pending" &&
			isExisting.friendId === currentUserDbData._id
		) {
			await ctx.db.patch(isExisting._id, {
				status: "accepted",
				acceptedAt: new Date().toISOString(),
			});
			return;
		}

		await ctx.db.insert("friends", {
			userId: currentUserDbData._id,
			friendId: args.targetUserId,
			status: "pending",
		});
	},
});

export const removeFriendship = mutation({
	args: { targetUserId: v.id("users") },
	handler: async (ctx, args) => {
		const currentUser = await ctx.auth.getUserIdentity();
		if (!currentUser) {
			throw new ConvexError("You must be signed in to remove a friend.");
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

		const isExisting = await ctx.db
			.query("friends")
			.filter((q) =>
				q.or(
					q.and(
						q.eq(q.field("friendId"), currentUserDbData._id),
						q.eq(q.field("userId"), args.targetUserId),
					),
					q.and(
						q.eq(q.field("userId"), currentUserDbData._id),
						q.eq(q.field("friendId"), args.targetUserId),
					),
				),
			)
			.unique();

		if (!isExisting) {
			throw new ConvexError("Friend request does not exist.");
		}

		await ctx.db.delete(isExisting._id);
	},
});

export const getThisFriendship = query({
	args: { targetUserId: v.id("users") },
	handler: async (ctx, args) => {
		const currentUser = await ctx.auth.getUserIdentity();
		if (!currentUser) {
			throw new ConvexError("You must be signed in to get a friendship.");
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

		const friendship = await ctx.db
			.query("friends")
			.filter((q) =>
				q.or(
					q.and(
						q.eq(q.field("friendId"), currentUserDbData._id),
						q.eq(q.field("userId"), args.targetUserId),
					),
					q.and(
						q.eq(q.field("userId"), currentUserDbData._id),
						q.eq(q.field("friendId"), args.targetUserId),
					),
				),
			)
			.unique();

		return friendship;
	},
});

export const getFriendships = query({
	handler: async (ctx) => {
		const currentUser = await ctx.auth.getUserIdentity();
		if (!currentUser) {
			throw new ConvexError("You must be signed in to get friendships.");
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

		const friends = await ctx.db
			.query("friends")
			.filter((q) =>
				q.and(
					q.or(
						q.eq(q.field("userId"), currentUserDbData._id),
						q.eq(q.field("friendId"), currentUserDbData._id),
					),
					q.eq(q.field("status"), "accepted"),
				),
			)
			.collect();

		const friendsWithData = await Promise.all(
			friends.map(async (friend) => {
				const friendData = await ctx.db.get(
					friend.friendId === currentUserDbData._id
						? friend.userId
						: friend.friendId,
				);
				return {
					...friend,
					...friendData,
					activityStatus:
						currentUserDbData.activityStatus === "hidden"
							? "hidden"
							: friendData?.activityStatus,
				};
			}),
		);

		return { friendsWithData, currentUserDbData };
	},
});
