import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getChatRooms = query({
	args: {},
	handler: async (ctx) => {
		const currentUser = await ctx.auth.getUserIdentity();
		if (!currentUser) {
			throw new ConvexError("You must be logged in to access chat rooms.");
		}

		const curretUserDbData = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", currentUser.tokenIdentifier),
			)
			.first();

		if (!curretUserDbData) {
			throw new ConvexError("Current user data not found.");
		}

		const chatRooms = await ctx.db.query("chatRoom").collect();

		const currentUserChatRooms = chatRooms.filter((room) =>
			room.parties.some((party) => party === curretUserDbData._id),
		);

		return Promise.all(
			currentUserChatRooms.map(async (room) => {
				const otherPartyIds = room.parties.filter(
					(user) => user !== curretUserDbData._id,
				);
				const partiesData = await Promise.all(
					otherPartyIds.map(
						async (user) =>
							await ctx.db
								.query("users")
								.filter((q) => q.eq(q.field("_id"), user))
								.first(),
					),
				);
				return {
					...room,
					partiesData,
				};
			}),
		);
	},
});

export const getChatRoomById = query({
	args: { chatRoomId: v.id("chatRoom") },
	handler: async (ctx, { chatRoomId }) => {
		const currentUser = await ctx.auth.getUserIdentity();
		if (!currentUser) {
			throw new ConvexError("You must be logged in to access chat rooms.");
		}

		const curretUserDbData = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", currentUser.tokenIdentifier),
			)
			.first();

		if (!curretUserDbData) {
			throw new ConvexError("Current user data not found.");
		}

		const chatRoomData = await ctx.db.get(chatRoomId);

		if (!chatRoomData) {
			throw new ConvexError("Chat room not found.");
		}

		if (!chatRoomData.parties.includes(curretUserDbData._id)) {
			throw new ConvexError("You are not a member of this chat room.");
		}

		const otherPartyIds = chatRoomData.parties.filter(
			(user) => user !== curretUserDbData._id,
		);

		const partiesData = await Promise.all(
			otherPartyIds.map(
				async (user) =>
					await ctx.db
						.query("users")
						.filter((q) => q.eq(q.field("_id"), user))
						.first(),
			),
		);

		return {
			...chatRoomData,
			partiesData,
			curretUserDbData,
		};
	},
});

// Return the chat room data along with the parties data

export const createChatRoom = mutation({
	args: { userIds: v.array(v.id("users")) },
	handler: async (ctx, { userIds }) => {
		const currentUser = await ctx.auth.getUserIdentity();
		if (!currentUser) {
			throw new ConvexError("You must be logged in to create a chat room.");
		}

		const curretUserDbData = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", currentUser.tokenIdentifier),
			)
			.first();

		if (!curretUserDbData) {
			throw new ConvexError("Current user data not found.");
		}

		const existingRoom = await ctx.db.query("chatRoom").collect();
		if (
			existingRoom.some(
				(room) =>
					room.parties.length === userIds.length + 1 &&
					room.parties.includes(curretUserDbData._id) &&
					userIds.every((id) => room.parties.includes(id)),
			)
		)
			return;

		await ctx.db.insert("chatRoom", {
			parties: [curretUserDbData._id, ...userIds],
		});
	},
});

export const sendChat = mutation({
	args: { chatRoomId: v.id("chatRoom"), content: v.string() },
	handler: async (ctx, { chatRoomId, content }) => {
		const currentUser = await ctx.auth.getUserIdentity();
		if (!currentUser) {
			throw new ConvexError("You must be logged in to send a message.");
		}
		const currentUserDbData = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", currentUser.tokenIdentifier),
			)
			.first();
		if (!currentUserDbData) {
			throw new ConvexError(
				"Current user can not be found with the provided token identifier.",
			);
		}
		const chatRoomData = await ctx.db.get(chatRoomId);

		if (!chatRoomData) {
			throw new ConvexError("Chat room not found.");
		}

		if (!chatRoomData.parties.includes(currentUserDbData._id)) {
			throw new ConvexError("You are not a member of this chat room.");
		}

		await ctx.db.insert("chatMessages", {
			content,
			roomId: chatRoomId,
			userId: currentUserDbData._id,
		});
	},
});

export const getChats = query({
	args: {
		chatRoomId: v.id("chatRoom"),
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, { chatRoomId, paginationOpts }) => {
		const currentUser = await ctx.auth.getUserIdentity();
		if (!currentUser) {
			throw new ConvexError("You must be logged in to access chat messages.");
		}

		const currentUserDbData = await ctx.db
			.query("users")
			.withIndex("by_token", (q) =>
				q.eq("tokenIdentifier", currentUser.tokenIdentifier),
			)
			.first();

		if (!currentUserDbData) {
			throw new ConvexError("Current user data not found.");
		}

		const chatRoomData = await ctx.db.get(chatRoomId);

		if (!chatRoomData) {
			throw new ConvexError("Chat room not found.");
		}

		if (!chatRoomData.parties.includes(currentUserDbData._id)) {
			throw new ConvexError("You are not a member of this chat room.");
		}

		return await ctx.db
			.query("chatMessages")
			.filter((q) => q.eq(q.field("roomId"), chatRoomId))
			.order("desc")
			.paginate(paginationOpts);
	},
});
