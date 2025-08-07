"use client";

import { useQuery } from "convex/react";
import ChatRoomBar from "@/components/chat-room-bar";
import { api } from "@/convex/_generated/api";

export default function Chat() {
	const chatRoomsData = useQuery(api.chat.getChatRooms);
	return (
		<main data-slot="unaffected-by-mobile-nav">
			<div className="bg-muted h-12 flex items-center rounded-b-md px-2 sm:px-4 -mt-2 sm:-mt-4">
				<h1 className="text-2xl font-bold">Chats</h1>
			</div>
			{chatRoomsData?.map((chatRoomData) => (
				<ChatRoomBar key={chatRoomData._id} chatRoomData={chatRoomData} />
			))}
		</main>
	);
}
