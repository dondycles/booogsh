"use client";
import { Dot, Ellipsis } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Avatar from "./avatar";
import Username from "./username";
import { Doc } from "@/convex/_generated/dataModel";
import UserDotStatus from "./user-dot-status";
export default function OnlineFriends() {
  const friends = useQuery(api.friends.getFriendships);

  return (
    <div className="fixed bottom-0 right-0 h-[calc(100vh-60px)] w-[calc((100vw-590px)/2)] flex flex-col p-2 sm:p-4 gap-2 sm:gap-4">
      <div className="border-b pb-2 inline-flex items-center justify-between gap-2">
        <div className="font-semibold text-muted-foreground inline-flex truncate">
          <span>
            <Dot className="text-green-600 stroke-6" />
          </span>
          <span>Online Friends</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground">
              <Ellipsis className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Set Active Status</DropdownMenuItem>
            <DropdownMenuItem>Hide Online Friends</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {friends?.map((friend) => (
        <div key={friend._id} className="flex gap-2 items-center">
          <Avatar user={friend as Doc<"users">} size={32} />
          <Username username={friend.username} />
          <UserDotStatus
            activityStatus={friend.activityStatus}
            lastActivity={friend.lastActivity}
            className="ml-auto mr-0"
          />
        </div>
      ))}
    </div>
  );
}
