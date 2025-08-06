"use client";

import { useQuery } from "convex/react";
import ChatRoomBar from "@/components/chat-room-bar";
import { api } from "@/convex/_generated/api";

export default function Chat() {
	const chatRooms = useQuery(api.chat.getChatRooms);
	return (
		<main className="px-2 sm:px-4 pt-2 sm:pt-4 pb-24 flex flex-col gap-2 sm:gap-4 max-w-xl w-full mx-auto col-start-2">
			<div className="bg-muted h-12 flex items-center rounded-md px-2 sm:px-4">
				<h1 className="text-2xl font-bold">Chats</h1>
			</div>
			{chatRooms?.map((chatRoom) => (
				<ChatRoomBar key={chatRoom._id} chatRoom={chatRoom} />
			))}
		</main>
	);
}
