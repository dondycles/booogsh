import { useContext } from "react";
import { cn } from "@/lib/utils";
import { ChatRoomsContext } from "./contexts/chat-rooms-context";

export default function UnseenChatsCounter({
	className,
}: {
	className?: string;
}) {
	const chatRoomsData = useContext(ChatRoomsContext);
	const unseenMessagesCount = chatRoomsData?.reduce((count, room) => {
		return (
			count +
			(room.latestMessage &&
			room.latestMessage.userId !== room.currentUserDbData._id &&
			!room.isLatestMessageSeenByCurrentUser
				? 1
				: 0)
		);
	}, 0);
	return unseenMessagesCount ? (
		<span className={cn("text-red-400 font-black", className)}>
			{unseenMessagesCount}
		</span>
	) : null;
}
