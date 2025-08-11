"use client";

import { createContext, useContext } from "react";
import type { Doc } from "@/convex/_generated/dataModel";

export interface ChatRoomsDataProps extends Doc<"chatRoom"> {
	currentUserDbData: Doc<"users">;
	partiesData: Array<Doc<"users"> | null>;
	latestMessage: Doc<"chatMessages"> | null;
	isLatestMessageSeenByCurrentUser: boolean;
}

export const ChatRoomsContext = createContext<ChatRoomsDataProps[] | undefined>(
	undefined,
);

export function useChatRoomsContext() {
	const context = useContext(ChatRoomsContext);
	if (!context) {
		throw new Error(
			"useChatRoomsContext must be used within a ChatRoomsProvider",
		);
	}
	return context;
}
export function ChatRoomsProvider({
	children,
	chatRoomsData,
}: {
	children: React.ReactNode;
	chatRoomsData: ChatRoomsDataProps[] | undefined;
}) {
	return (
		<ChatRoomsContext.Provider value={chatRoomsData}>
			{children}
		</ChatRoomsContext.Provider>
	);
}
