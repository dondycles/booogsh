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
		<main className="p-2 sm:p-4 flex flex-col max-w-xl w-full mx-auto col-start-2 border h-dvh relative gap-1">
			{chatRoomData._id ? (
				<>
					<div className="w-full flex items-center gap-2 bg-muted rounded-md p-2 sm:p-4">
						<Avatar user={chatRoomData.partiesData[0]} size={32} />
						<Username username={chatRoomData.partiesData[0]?.username} />
					</div>
					<Chats chatRoomData={chatRoomData} />
					<div className="sticky bottom-0 mt-0 -mb-4 -m-4 p-2 sm:p-4 bg-muted">
						<SendChatForm chatRoomId={chatRoomData._id} />
					</div>
				</>
			) : (
				<p className="text-muted-foreground text-sm italic bg-muted rounded-md p-2 sm:p-4 text-center col-start-2">
					Chat room not found
				</p>
			)}
		</main>
	);
}
