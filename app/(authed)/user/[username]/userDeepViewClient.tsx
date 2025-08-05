"use client";
import Avatar from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import UserPostsClient from "./userPosts";
import Image from "next/image";
import { CircleAlert, UserPlus } from "lucide-react";
import Username from "@/components/username";

export default function UserDeepViewClient({ username }: { username: string }) {
  const userProfile = useQuery(api.users.getUserProfile, { username });

  if (!userProfile?._id)
    return (
      <p className="text-muted-foreground text-sm italic bg-muted rounded-md p-2 sm:p-4 text-center">
        User not found
      </p>
    );

  return (
    <main className="p-2 sm:p-4 flex flex-col gap-2 sm:gap-4 w-full">
      <div className="flex flex-col gap-2 sm:gap-4 items-center justify-center bg-muted rounded-md px-2 sm:px-4 py-8 sm:py-16 relative [&>div]:drop-shadow-2xl [&>div]:z-10 overflow-hidden">
        <div>
          <Avatar user={userProfile} size={72} />
        </div>
        <div className="mx-auto text-center z-1">
          <h1 className="text-2xl font-semibold">{userProfile.name}</h1>
          <Username username={userProfile.username} showAtSymbol />
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 mx-auto justify-center items-center z-1">
          <Button variant="secondary" className="flex-1">
            <UserPlus />
            Add friend
          </Button>
          <Button
            variant="outline"
            className="flex-1 hover:text-destructive text-destructive dark:border-destructive border-destructive"
          >
            <CircleAlert />
            Block
          </Button>
        </div>
        {userProfile.pfp ? (
          <Image
            src={userProfile.pfp}
            alt={`${userProfile.name}'s profile picture`}
            width={720}
            height={720}
            className="absolute top-0 left-0 w-full h-full object-cover rounded-md z-0 opacity-15 blur-lg"
          />
        ) : null}
      </div>

      <UserPostsClient userId={userProfile._id} />
    </main>
  );
}
