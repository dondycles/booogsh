import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { compact } from "lodash";
import { mutation, query } from "./_generated/server";
export const getChatRooms = query({
	args: {},
	handler: async (ctx) => {
		const currentUser = await ctx.auth.getUserIdentity();
		if (!currentUser) {
			throw new ConvexError("You must be logged in to access chat rooms.");
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

		const currentUserChatRooms = await ctx.db
			.query("userChatRooms")
			.withIndex("byUser", (q) => q.eq("userId", currentUserDbData._id))
			.unique();

		const currentUserChatRoomsData = compact(
			await Promise.all(
				(currentUserChatRooms?.chatRoomIds || []).map(async (room) => {
					const roomData = await ctx.db.get(room);

					if (roomData && !roomData.parties.includes(currentUserDbData._id))
						throw new ConvexError("You are not a member of this chat room.");

					return roomData;
				}),
			),
		);

		return await Promise.all(
			currentUserChatRoomsData.map(async (room) => {
				const otherPartyIds = room.parties.filter(
					(user) => user !== currentUserDbData._id,
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

				const latestMessage = await ctx.db
					.query("chatMessages")
					.filter((q) => q.eq(q.field("roomId"), room._id))
					.order("desc")
					.first();

				const isLatestMessageSeenByCurrentUser = await ctx.db
					.query("lastMessageSeen")
					.withIndex("byRoomAndUserAndMessage", (q) =>
						q
							.eq("roomId", room._id)
							.eq("userId", currentUserDbData._id)
							.eq("messageId", latestMessage?._id),
					)
					.first();

				return {
					...room,
					partiesData,
					latestMessage,
					currentUserDbData,
					isLatestMessageSeenByCurrentUser: !!isLatestMessageSeenByCurrentUser,
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

		const latestMessage = await ctx.db
			.query("chatMessages")
			.filter((q) => q.eq(q.field("roomId"), chatRoomId))
			.order("desc")
			.first();

		return {
			...chatRoomData,
			partiesData,
			curretUserDbData,
			latestMessage,
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

		const currentUserChatRooms = await ctx.db
			.query("userChatRooms")
			.withIndex("byUser", (q) => q.eq("userId", curretUserDbData._id))
			.unique();

		for (const chatRoom of currentUserChatRooms?.chatRoomIds || []) {
			const chatRoomData = await ctx.db.get(chatRoom);
			if (chatRoomData) {
				if (
					chatRoomData.parties.length === userIds.length + 1 &&
					chatRoomData.parties.includes(curretUserDbData._id) &&
					userIds.every((id) => chatRoomData.parties.includes(id))
				)
					// If the chat room already exists with the same parties, don't create a new one
					return;
			}
		}

		const chatRoomId = await ctx.db.insert("chatRoom", {
			parties: [curretUserDbData._id, ...userIds],
		});

		if (currentUserChatRooms)
			await ctx.db.patch(currentUserChatRooms._id, {
				chatRoomIds: [...(currentUserChatRooms.chatRoomIds ?? []), chatRoomId],
			});
		else
			await ctx.db.insert("userChatRooms", {
				userId: curretUserDbData._id,
				chatRoomIds: [chatRoomId],
			});
		for (const targetUserId of userIds) {
			const targetUserChatRooms = await ctx.db
				.query("userChatRooms")
				.withIndex("byUser", (q) => q.eq("userId", targetUserId))
				.unique();

			if (targetUserChatRooms) {
				await ctx.db.patch(targetUserChatRooms._id, {
					chatRoomIds: [...(targetUserChatRooms.chatRoomIds ?? []), chatRoomId],
				});
			} else {
				await ctx.db.insert("userChatRooms", {
					userId: targetUserId,
					chatRoomIds: [chatRoomId],
				});
			}
		}
	},
});

export const getChatRoomIdWithTargetUserOrCreate = mutation({
	args: { targetUserId: v.id("users") },
	handler: async (ctx, { targetUserId }) => {
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

		const currentUserChatRooms = await ctx.db
			.query("userChatRooms")
			.withIndex("byUser", (q) => q.eq("userId", curretUserDbData._id))
			.unique();

		if (currentUserChatRooms?.chatRoomIds) {
			for (const roomId of currentUserChatRooms.chatRoomIds) {
				const roomData = await ctx.db.get(roomId);
				if (
					roomData &&
					roomData.parties.length === 2 &&
					roomData.parties.includes(curretUserDbData._id) &&
					roomData.parties.includes(targetUserId)
				) {
					return roomData._id;
				}
			}
		}

		const targetUserChatRooms = await ctx.db
			.query("userChatRooms")
			.withIndex("byUser", (q) => q.eq("userId", targetUserId))
			.unique();

		if (targetUserChatRooms?.chatRoomIds) {
			for (const roomId of targetUserChatRooms.chatRoomIds) {
				const roomData = await ctx.db.get(roomId);
				if (
					roomData &&
					roomData.parties.length === 2 &&
					roomData.parties.includes(targetUserId) &&
					roomData.parties.includes(curretUserDbData._id)
				) {
					return roomData._id;
				}
			}
		}

		const chatRoomId = await ctx.db.insert("chatRoom", {
			parties: [curretUserDbData._id, targetUserId],
		});

		if (currentUserChatRooms)
			await ctx.db.patch(currentUserChatRooms._id, {
				chatRoomIds: [...(currentUserChatRooms.chatRoomIds ?? []), chatRoomId],
			});
		else
			await ctx.db.insert("userChatRooms", {
				userId: curretUserDbData._id,
				chatRoomIds: [chatRoomId],
			});

		if (targetUserChatRooms) {
			await ctx.db.patch(targetUserChatRooms._id, {
				chatRoomIds: [...(targetUserChatRooms.chatRoomIds ?? []), chatRoomId],
			});
		} else {
			await ctx.db.insert("userChatRooms", {
				userId: targetUserId,
				chatRoomIds: [chatRoomId],
			});
		}

		return chatRoomId;
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

export const seenChat = mutation({
	args: { chatRoomId: v.id("chatRoom"), messageId: v.id("chatMessages") },
	handler: async (ctx, { chatRoomId, messageId }) => {
		const currentUser = await ctx.auth.getUserIdentity();
		if (!currentUser) {
			throw new ConvexError("You must be logged in to mark messages as seen.");
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

		const message = await ctx.db.get(messageId);
		if (!message || message.roomId !== chatRoomId) {
			throw new ConvexError("Message not found in this chat room.");
		}

		const existingSeen = await ctx.db
			.query("lastMessageSeen")
			.withIndex("byRoomAndUserAndMessage", (q) =>
				q.eq("roomId", chatRoomId).eq("userId", currentUserDbData._id),
			)
			.first();

		if (existingSeen) {
			await ctx.db.patch(existingSeen._id, {
				messageId,
			});
			return;
		}

		await ctx.db.insert("lastMessageSeen", {
			roomId: chatRoomId,
			userId: currentUserDbData._id,
			messageId,
		});
	},
});

export const getLastMessageSeen = query({
	args: { chatRoomId: v.id("chatRoom"), partiesIds: v.array(v.id("users")) },
	handler: async (ctx, { chatRoomId, partiesIds }) => {
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

		return compact(
			await Promise.all(
				partiesIds.map(async (partyId) => {
					const lastSeen = await ctx.db
						.query("lastMessageSeen")
						.withIndex("byRoomAndUserAndMessage", (q) =>
							q.eq("roomId", chatRoomId).eq("userId", partyId),
						)
						.first();
					return lastSeen;
				}),
			),
		);
	},
});
