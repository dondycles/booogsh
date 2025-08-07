"use client";
import { useQuery } from "convex/react";
import Avatar from "@/components/avatar";
import SendChatForm from "@/components/forms/send-chat-form";
import Username from "@/components/username";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Chats from "./_chats";

export default function ChatRoomDeepViewClient({ id }: { id: Id<"chatRoom"> }) {
	const chatRoomData = useQuery(api.chat.getChatRoomById, { chatRoomId: id });
	if (!chatRoomData) return;
	return (
		<main data-slot="affected-by-mobile-nav">
			{chatRoomData._id ? (
				<div className="h-full flex flex-col gap-1">
					<div className="flex items-center gap-2 bg-muted rounded-b-md p-2 sm:p-4 -mt-2 sm:-mt-4">
						<Avatar user={chatRoomData.partiesData[0]} size={32} />
						<Username username={chatRoomData.partiesData[0]?.username} />
					</div>
					<Chats chatRoomData={chatRoomData} />
					<div className="sticky bottom-0 p-2 sm:p-4 bg-muted rounded-t-md">
						<SendChatForm chatRoomId={chatRoomData._id} />
					</div>
				</div>
			) : (
				<p className="text-muted-foreground text-sm italic bg-muted rounded-md p-2 sm:p-4 text-center col-start-2">
					Chat room not found
				</p>
			)}
		</main>
	);
}
