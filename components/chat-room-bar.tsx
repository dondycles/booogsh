import { Archive, VolumeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { Doc } from "@/convex/_generated/dataModel";
import { useGetTimeDifference } from "@/hooks/use-get-time-difference";
import Avatar from "./avatar";
import Username from "./username";

export default function ChatRoomBar({
	chatRoomData,
}: {
	chatRoomData: Doc<"chatRoom"> & {
		partiesData: Array<Doc<"users"> | null>;
		latestMessage: Doc<"chatMessages"> | null;
		currentUserDbData: Doc<"users">;
		isLatestMessageSeenByCurrentUser: boolean;
	};
}) {
	const navigate = useRouter();

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<button
					onClick={() => navigate.push(`/chat/${chatRoomData._id}`)}
					type="button"
					className="w-full flex items-start justify-start gap-2 hover:bg-accent bg-muted rounded-md p-2 sm:p-4"
				>
					<Avatar disableLink user={chatRoomData.partiesData[0]} />
					<div className="flex flex-col gap-1 text-left w-full">
						<Username
							disableLink
							username={chatRoomData.partiesData[0]?.username}
						/>
						<p className="flex line-clamp-1 gap-2 justify-between">
							<span
								className={`text-sm line-clamp-1 ${chatRoomData.latestMessage?.userId === chatRoomData.currentUserDbData._id ? "text-muted-foreground" : chatRoomData.isLatestMessageSeenByCurrentUser ? "text-muted-foreground" : "text-foreground"}`}
							>
								{chatRoomData.latestMessage?.content}
							</span>
							<span className="text-muted-foreground text-sm shrink-0">
								{
									useGetTimeDifference(
										chatRoomData.latestMessage?._creationTime,
									).timeDifferenceString
								}
							</span>
						</p>
					</div>
				</button>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem>
					<Archive />
					Archive
				</ContextMenuItem>
				<ContextMenuItem>
					<VolumeOff />
					Mute
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
