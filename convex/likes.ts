import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const toggleLikePost = mutation({
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

		if (post.privacy === "private" && post.userId !== currentUserDbData._id) {
			throw new ConvexError("You are not authorized to like this post.");
		}

		const like = await ctx.db
			.query("postLikes")
			.withIndex("byPostAndUser", (q) =>
				q.eq("postId", postId).eq("userId", currentUserDbData._id),
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
				userId: currentUserDbData._id,
			});
		}
	},
});

export const toggleLikeComment = mutation({
	args: { commentId: v.id("postComments") },
	handler: async (ctx, { commentId }) => {
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

		const comment = await ctx.db.get(commentId);

		if (!comment) {
			throw new ConvexError("Comment not found.");
		}

		const like = await ctx.db
			.query("postCommentLikes")
			.withIndex("byCommentAndUser", (q) =>
				q.eq("commentId", commentId).eq("userId", currentUserDbData._id),
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
				userId: currentUserDbData._id,
			});
		}
	},
});
