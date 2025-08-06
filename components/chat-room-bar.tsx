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
	chatRoom,
}: {
	chatRoom: Doc<"chatRoom"> & {
		partiesData: Array<Doc<"users"> | null>;
		latestMessage: Doc<"chatMessages"> | null;
		curretUserDbData: Doc<"users">;
	};
}) {
	const navigate = useRouter();

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<button
					onClick={() => navigate.push(`/chat/${chatRoom._id}`)}
					type="button"
					className="w-full flex items-start justify-start gap-2 hover:bg-accent bg-muted rounded-md p-2 sm:p-4"
				>
					<Avatar disableLink user={chatRoom.partiesData[0]} />
					<div className="flex flex-col gap-1 text-left w-full">
						<Username
							disableLink
							username={chatRoom.partiesData[0]?.username}
						/>
						<p className="flex line-clamp-1 gap-2 justify-between">
							<span
								className={`text-sm line-clamp-1 ${chatRoom.latestMessage?.userId === chatRoom.curretUserDbData._id ? "text-muted-foreground" : "text-foreground"}`}
							>
								{chatRoom.latestMessage?.content}
							</span>
							<span className="text-muted-foreground text-sm shrink-0">
								{
									useGetTimeDifference(chatRoom.latestMessage?._creationTime)
										.timeDifferenceString
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
