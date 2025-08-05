"use client";
import { Dot, Ellipsis } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Avatar from "./avatar";
import Username from "./username";
import { Doc } from "@/convex/_generated/dataModel";
import * as UserDotStatus from "./user-dot-status";
import React from "react";
import { ScrollArea } from "./ui/scroll-area";
export default function Friends() {
  const friends = useQuery(api.friends.getFriendships);
  const toggleActivityStatus = useMutation(api.users.toggleUserActivityStatus);

  return (
    <div className="fixed bottom-0 right-0 h-[calc(100vh-60px)] w-[calc((100vw-590px)/2)] flex flex-col px-2 sm:px-4 pt-2 sm:pt-4">
      <div className="border-b pb-2 inline-flex items-center justify-between gap-2">
        <div className="font-semibold text-muted-foreground inline-flex truncate">
          <span>Friends</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground">
              <Ellipsis className="size-4" />
            </button>
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
  );
}
