import { Archive, VolumeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { Doc } from "@/convex/_generated/dataModel";
import Avatar from "./avatar";
import Username from "./username";

export default function ChatRoomBar({
	chatRoom,
}: {
	chatRoom: Doc<"chatRoom"> & {
		partiesData: Array<Doc<"users"> | null>;
	};
}) {
	const navigate = useRouter();
	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<button
					onClick={() => navigate.push(`/chat/${chatRoom._id}`)}
					type="button"
					className="w-full flex items-start justify-start gap-2 bg-muted rounded-md p-2 sm:p-4"
				>
					<Avatar disableLink user={chatRoom.partiesData[0]} />
					<div className="flex flex-col gap-1 text-left">
						<Username
							disableLink
							username={chatRoom.partiesData[0]?.username}
						/>
						<p className="flex">
							<span className="text-sm line-clamp-1">
								Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum
								inventore debitis aspernatur!
							</span>
							<span className="text-muted-foreground text-sm">15hr</span>
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
