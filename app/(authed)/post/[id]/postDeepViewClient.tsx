"use client";
import PostCard, {
  PostBody,
  PostCardProps,
  PostComments,
  PostFooter,
  PostHeader,
  PostLikeButton,
  PostOptions,
  PostShareButton,
} from "@/components/post-card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { useQuery } from "convex/react";

export default function PostDeepViewClient({
  postId,
}: {
  postId: Id<"posts">;
}) {
  const { user } = useStoreUserEffect();
  const post = useQuery(api.posts.getPostDeepView, { postId });
  if (!post) return;
  return (
    <PostCard currentUser={user} post={post as PostCardProps["post"]}>
      <PostHeader>
        <PostOptions />
      </PostHeader>
      <PostBody />
      <PostFooter>
        <PostLikeButton />
        <PostShareButton />
      </PostFooter>
      <PostComments />
    </PostCard>
  );
}
