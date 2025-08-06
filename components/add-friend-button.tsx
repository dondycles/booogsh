import { useMutation, useQuery } from "convex/react";
import { UserCheck, UserPlus, UserX } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "./ui/button";

export default function AddFriendButton({
	targetUser,
	currentUser,
}: {
	targetUser: Doc<"users">;
	currentUser: Doc<"users"> | null;
}) {
	const friendship = useQuery(api.friends.getThisFriendship, {
		targetUserId: targetUser._id,
	});
	const removeFriend = useMutation(api.friends.removeFriendship);
	const toggleFriendship = useMutation(api.friends.toggleFriendship);

	if (currentUser?._id === targetUser._id) {
		return null;
	}

	if (friendship?.status === "accepted") {
		return (
			<Button
				variant="outline"
				className="flex-1 hover:text-destructive text-destructive dark:border-destructive border-destructive"
				onClick={() => removeFriend({ targetUserId: targetUser._id })}
			>
				Remove friend
			</Button>
		);
	}
	return (
		<Button
			variant={friendship?.status !== "pending" ? "default" : "outline"}
			className="flex-1"
			onClick={() => toggleFriendship({ targetUserId: targetUser._id })}
		>
			{friendship?.status === "pending" ? (
				friendship?.userId === currentUser?._id ? (
					<UserX />
				) : (
					<UserCheck />
				)
			) : (
				<UserPlus />
			)}
			{friendship?.status === "pending"
				? friendship?.userId === currentUser?._id
					? "Cancel Request"
					: "Accept Request"
				: "Add Friend"}
		</Button>
	);
}
