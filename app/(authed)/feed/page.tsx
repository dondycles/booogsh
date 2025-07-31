"use client";

import AddPostForm from "@/components/forms/add-post-form";
import PostCard from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { usePaginatedQuery } from "convex/react";
import { Loader2 } from "lucide-react";

export default function Feed() {
  const { isAuthenticated, user, isLoading } = useStoreUserEffect();

  const {
    isLoading: isLoadingMorePosts,
    loadMore: loadMorePosts,
    results: posts,
    status: postsStatus,
  } = usePaginatedQuery(api.posts.getPublicPosts, {}, { initialNumItems: 5 });

  const isLoadingAll = isLoading || postsStatus === "LoadingFirstPage";

  return (
    <main className="p-2 sm:p-4 flex flex-col gap-2 sm:gap-4 max-w-xl w-full mx-auto col-start-2">
      {isLoadingAll ? (
        <div className="text-muted-foreground inline-flex space-x-2 items-center justify-center py-8 text-sm">
          <Loader2 className="animate-spin" />
          <span>Getting everything ready...</span>
        </div>
      ) : (
        <>
          {isAuthenticated ? <AddPostForm /> : null}
          {posts?.map((post) => (
            <PostCard key={post._id} post={post} currentUser={user} />
          ))}
          <Button
            hidden={postsStatus !== "CanLoadMore"}
            onClick={() => loadMorePosts(5)}
            disabled={postsStatus !== "CanLoadMore" || isLoadingMorePosts}
            className="text-muted-foreground"
            variant="secondary"
          >
            Load more posts?
          </Button>
        </>
      )}
    </main>
  );
}
