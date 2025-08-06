"use client";
import { useMutation, useQuery } from "convex/react";
import { Dot, Ellipsis } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import Avatar from "./avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import * as UserDotStatus from "./user-dot-status";
import Username from "./username";
export default function Friends() {
	const friends = useQuery(api.friends.getFriendships);
	const toggleActivityStatus = useMutation(api.users.toggleUserActivityStatus);

	return (
		<div className="fixed bottom-0 right-0 h-dvh w-[calc((100vw-590px)/2)] flex  items-start justify-start">
			<div className="flex flex-col p-2 sm:p-4 max-w-sm w-full">
				<div className="border-b pb-2 inline-flex items-center justify-between gap-2">
					<div className="font-semibold text-muted-foreground inline-flex truncate">
						<span>Friends</span>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger className="text-muted-foreground">
							<Ellipsis className="size-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => {
									toggleActivityStatus();
								}}
							>
								<span>
									{friends?.currentUserDbData.activityStatus === "hidden" ? (
										<Dot className="text-muted-foreground stroke-20 size-2" />
									) : (
										<Dot className="text-green-600 stroke-20 size-2" />
									)}
								</span>
								Set Status to{" "}
								{friends?.currentUserDbData.activityStatus !== "hidden"
									? "Hidden"
									: "Visible"}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<ScrollArea className="overflow-auto">
					<div className="flex flex-col gap-2 sm:gap-4 py-2 sm:py-4">
						{friends?.currentUserDbData.activityStatus === "hidden" ? (
							<p className="text-muted-foreground text-sm italic">
								Set your status to visible to see your friends recent activiness
								here.
							</p>
						) : null}
						{friends?.friendsWithData?.map((friend) => (
							<div key={friend._id} className="flex gap-2 items-center">
								<Avatar user={friend as Doc<"users">} size={32} />
								<Username username={friend.username} />

								<UserDotStatus.Context
									value={{
										lastActivity: friend.lastActivity,
										activityStatus: friend.activityStatus,
									}}
								>
									<UserDotStatus.Tooltip className="ml-auto mr-0">
										<UserDotStatus.Dot />
									</UserDotStatus.Tooltip>
								</UserDotStatus.Context>
							</div>
						))}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
