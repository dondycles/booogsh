import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useContext } from "react";
import { ChatRoomsContext } from "./contexts/chat-rooms-context";
import { Button } from "./ui/button";

export default function ChatNavButton() {
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
	return (
		<Button
			variant="ghost"
			asChild
			className="flex flex-row justify-baseline gap-2 h-fit text-foreground/75"
		>
			<Link href="/chat">
				<span>
					<MessageCircle className="size-8 shrink-0 " />
				</span>
				Chat
				{unseenMessagesCount ? (
					<span className="text-red-400 font-black">{unseenMessagesCount}</span>
				) : null}
			</Link>
		</Button>
	);
}
