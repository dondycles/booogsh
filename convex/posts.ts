import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getGettablePosts = query({
	args: {
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		const currentUser = await ctx.auth.getUserIdentity();
		const currentUserDbData = currentUser
			? await ctx.db
					.query("users")
					.withIndex("by_token", (q) =>
						q.eq("tokenIdentifier", currentUser.tokenIdentifier),
					)
					.unique()
			: null;

		if (!currentUserDbData) {
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

		const currentUserFriends = await ctx.db
			.query("friends")
			.filter((q) =>
				q.and(
					q.or(
						q.eq(q.field("friendId"), currentUserDbData._id),

						q.eq(q.field("userId"), currentUserDbData._id),
					),
					q.eq(q.field("status"), "accepted"),
				),
			)
			.collect();

		const results = await ctx.db
			.query("posts")
			.filter((q) =>
				q.or(
					q.neq(q.field("privacy"), "private"),
					q.eq(q.field("userId"), currentUserDbData._id),
				),
			)
			.order("desc")
			.paginate(args.paginationOpts);

		const mappedPage = await Promise.all(
			results.page
				.filter(
					(post) =>
						post.privacy === "private" ||
						post.privacy === "public" ||
						(post.privacy === "friends" &&
							currentUserFriends.some(
								(friend) =>
									friend.friendId === post.userId ||
									friend.userId === post.userId,
							)),
				)
				.map(async (post) => {
					const user = await ctx.db.get(post.userId);
					const isLiked = currentUserDbData
						? await ctx.db
								.query("postLikes")
								.withIndex("byPostAndUser", (q) =>
									q.eq("postId", post._id).eq("userId", currentUserDbData._id),
								)
								.unique()
						: null;

					return {
						...post,
						user,
						isLiked: !!isLiked,
						// sharedPost: null,
					};
				}),
		);

		return {
			...results,
			page: mappedPage,
		};
	},
});

export const getPublicPostsOfThisUser = query({
	args: {
		paginationOpts: paginationOptsValidator,
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const currentUser = await ctx.auth.getUserIdentity();
		const currentUserDbData = currentUser
			? await ctx.db
					.query("users")
					.withIndex("by_token", (q) =>
						q.eq("tokenIdentifier", currentUser.tokenIdentifier),
					)
					.unique()
			: null;

		if (!currentUserDbData) {
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
				q.and(
					q.or(
						q.eq(q.field("privacy"), "public"),
						q.eq(q.field("userId"), currentUserDbData._id),
					),
					q.eq(q.field("userId"), args.userId),
				),
			)
			.order("desc")
			.paginate(args.paginationOpts);

		const mappedPage = await Promise.all(
			results.page.map(async (post) => {
				const user = await ctx.db.get(post.userId);
				const isLiked = currentUserDbData
					? await ctx.db
							.query("postLikes")
							.withIndex("byPostAndUser", (q) =>
								q.eq("postId", post._id).eq("userId", currentUserDbData._id),
							)
							.unique()
					: null;

				return {
					...post,
					user,
					isLiked: !!isLiked,
					// sharedPost: null,
				};
			}),
		);

		return {
			...results,
			page: mappedPage,
		};
	},
});

export const getSharedPost = query({
	args: { postId: v.id("posts") },
	handler: async (ctx, { postId }) => {
		const currentUser = await ctx.auth.getUserIdentity();
		const currentUserDbData = currentUser
			? await ctx.db
					.query("users")
					.withIndex("by_token", (q) =>
						q.eq("tokenIdentifier", currentUser.tokenIdentifier),
					)
					.unique()
			: null;

		const post = await ctx.db
			.query("posts")
			.filter((q) =>
				q.and(
					q.or(
						q.eq(q.field("privacy"), "public"),
						q.eq(q.field("userId"), currentUserDbData?._id),
					),
					q.eq(q.field("_id"), postId),
				),
			)
			.unique();

		const user = post ? await ctx.db.get(post.userId) : null;

		const isLiked =
			post && currentUserDbData
				? await ctx.db
						.query("postLikes")
						.withIndex("byPostAndUser", (q) =>
							q.eq("postId", post._id).eq("userId", currentUserDbData._id),
						)
						.unique()
				: null;

		return { ...post, user, isLiked: !!isLiked };
	},
});

export const getPostDeepView = query({
	args: { postId: v.id("posts") },
	handler: async (ctx, { postId }) => {
		const currentUser = await ctx.auth.getUserIdentity();
		const currentUserDbData = currentUser
			? await ctx.db
					.query("users")
					.withIndex("by_token", (q) =>
						q.eq("tokenIdentifier", currentUser.tokenIdentifier),
					)
					.unique()
			: null;
		const post = await ctx.db
			.query("posts")
			.filter((q) =>
				q.and(
					q.or(
						q.eq(q.field("privacy"), "public"),
						q.eq(q.field("userId"), currentUserDbData?._id),
					),
					q.eq(q.field("_id"), postId),
				),
			)
			.unique();

		const isLiked =
			post && currentUserDbData
				? await ctx.db
						.query("postLikes")
						.withIndex("byPostAndUser", (q) =>
							q.eq("postId", post._id).eq("userId", currentUserDbData._id),
						)
						.unique()
				: null;

		const user = post ? await ctx.db.get(post.userId) : null;

		return {
			...post,
			user,
			isLiked: !!isLiked,
		};
	},
});

export const getMyPosts = query({
	handler: async (ctx) => {
		const user = await ctx.auth.getUserIdentity();
		if (!user) {
			throw new ConvexError("You must be signed in to get your posts.");
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
		sharedPostId: v.optional(v.id("posts")),
	},
	handler: async (ctx, args) => {
		const currentUser = await ctx.auth.getUserIdentity();

		if (!currentUser) {
			throw new Error("You must be signed to post.");
		}

		const currentUserDbData = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", currentUser.tokenIdentifier),
			)
			.unique();

		if (!currentUserDbData) {
			throw new Error(
				"Current user can not be found with the provided token identifier.",
			);
		}

		return await ctx.db.insert("posts", {
			message: args.message,
			privacy: args.privacy,
			userId: currentUserDbData?._id,
			sharedPostId: args.sharedPostId,
		});
	},
});

export const remove = mutation({
	args: { postId: v.id("posts") },
	handler: async (ctx, { postId }) => {
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

		if (post.userId !== currentUserDbData._id) {
			throw new ConvexError("You are not authorized to delete this post.");
		}

		const likes = await ctx.db
			.query("postLikes")
			.withIndex("byPost", (q) => q.eq("postId", postId))
			.collect();

		for (const like of likes) {
			await ctx.db.delete(like._id);
		}

		const comments = await ctx.db
			.query("postComments")
			.withIndex("byPost", (q) => q.eq("postId", postId))
			.collect();

		for (const comment of comments) {
			const commentLikes = await ctx.db
				.query("postCommentLikes")
				.withIndex("byComment", (q) => q.eq("commentId", comment._id))
				.collect();
			if (commentLikes.length > 0) {
				for (const commentLike of commentLikes) {
					await ctx.db.delete(commentLike._id);
				}
				await ctx.db.delete(comment._id);
			}
		}
		await ctx.db.delete(postId);
	},
});

export const update = mutation({
	args: {
		postId: v.id("posts"),
		message: v.string(),
		privacy: v.union(
			v.literal("public"),
			v.literal("private"),
			v.literal("friends"),
		),
	},
	handler: async (ctx, args) => {
		const currentUser = await ctx.auth.getUserIdentity();
		if (!currentUser) {
			throw new ConvexError("You must be signed in to update a post.");
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

		const post = await ctx.db.get(args.postId);
		if (!post) {
			throw new ConvexError("Post not found.");
		}

		if (post.userId !== currentUserDbData._id) {
			throw new ConvexError("You are not authorized to update this post.");
		}

		await ctx.db.patch(post._id, {
			message: args.message,
			privacy: args.privacy,
		});
	},
});
