"use client";
import { useQuery } from "convex/react";
import * as Post from "@/components/post-card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";

export default function PostDeepViewClient({
	postId,
}: {
	postId: Id<"posts">;
}) {
	const { user } = useStoreUserEffect();
	const post = useQuery(api.posts.getPostDeepView, { postId });
	if (!post) return;
	return (
		<Post.Card currentUser={user} post={post as Post.PostCardProps["post"]}>
			<Post.Header>
				<Post.PostOptions />
			</Post.Header>
			<Post.Body />
			<Post.Footer>
				<Post.LikeButton />
				<Post.ShareButton />
			</Post.Footer>
			<Post.Comments />
		</Post.Card>
	);
}
