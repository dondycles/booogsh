"use client";

import { useContext } from "react";
import ChatRoomBar from "@/components/chat-room-bar";
import { ChatRoomsContext } from "@/components/contexts/chat-rooms-context";

export default function Chat() {
	const chatRoomsData = useContext(ChatRoomsContext);
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
