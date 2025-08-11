"use client";
import { useMutation, useQuery } from "convex/react";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AddFriendButton from "@/components/add-friend-button";
import Avatar from "@/components/avatar";
import { Button } from "@/components/ui/button";
import Username from "@/components/username";
import { api } from "@/convex/_generated/api";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import UserPostsClient from "./_userPosts";

export default function UserDeepViewClient({ username }: { username: string }) {
	const router = useRouter();
	const { user: currentUser } = useStoreUserEffect();
	const userProfile = useQuery(api.users.getUserProfile, { username });

	const getOrCreateChatRoom = useMutation(
		api.chat.getChatRoomIdWithTargetUserOrCreate,
	);

	const handleGetOrCreateChatRoom = async () => {
		if (!userProfile?._id) return;
		const roomId = await getOrCreateChatRoom({ targetUserId: userProfile._id });
		if (roomId) {
			router.push(`/chat/${roomId}`);
		}
	};

	if (!userProfile) return;

	if (!userProfile?._id)
		return (
			<p className="text-muted-foreground text-sm italic bg-muted rounded-md p-2 sm:p-4 text-center col-start-2">
				User not found
			</p>
		);

	return (
		<main data-slot="unaffected-by-mobile-nav">
			<div className="flex flex-col gap-2 sm:gap-4 items-center justify-center bg-muted px-2 sm:px-4 py-8 sm:py-16 relative [&>div]:drop-shadow-2xl [&>div]:z-10 overflow-hidden rounded-b-md -mt-4">
				<div>
					<Avatar
						user={userProfile}
						size={72}
						showDotStatus
						dotStatusClassName="size-6 stroke-12"
						showDotStatusTooltip
					/>
				</div>
				<div className="mx-auto text-center z-1">
					<h1 className="text-2xl font-semibold">{userProfile.name}</h1>
					<Username username={userProfile.username} showAtSymbol />
				</div>
				<div className="flex flex-wrap gap-2 sm:gap-4 mx-auto justify-center items-center z-1">
					{!currentUser || currentUser._id === userProfile._id ? null : (
						<AddFriendButton
							currentUser={currentUser}
							targetUser={userProfile}
						/>
					)}
					{!currentUser || currentUser._id === userProfile._id ? null : (
						<Button
							onClick={() => void handleGetOrCreateChatRoom()}
							variant="outline"
							className="flex-1"
						>
							<MessageCircle />
							Message
						</Button>
					)}
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
