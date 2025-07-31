"use client";
import AddPostForm from "@/components/forms/add-post-form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { useQuery } from "convex/react";
import {
  ThumbsUpIcon,
  MessageCircle,
  Share2,
  UserCircle2,
  Ellipsis,
  Trash2,
  Pencil,
  Globe2,
  Lock,
  Users2,
} from "lucide-react";
export default function Feed() {
  const { isAuthenticated } = useStoreUserEffect();
  const posts = useQuery(api.posts.getPublicPosts);
  return (
    <main className="p-4 flex flex-col gap-4 max-w-4xl mx-auto">
      {isAuthenticated ? <AddPostForm /> : null}

      {posts?.map((post) => (
        <div
          key={post._id}
          className="flex flex-col gap-4 bg-muted/25 rounded-md p-4"
        >
          <div className="flex place-items-start justify-between  text-muted-foreground gap-2">
            <div className="flex gap-2 items-start truncate">
              <UserCircle2 className="size-10 shrink-0 text-foreground" />
              <div className="space-y-1 inline-flex flex-col">
                <span className="text-sm font-semibold">
                  {post.user?.username}
                </span>
                <div className="text-xs space-x-1 inline-flex">
                  <span>
                    {post.privacy === "public" && <Globe2 className="size-4" />}
                    {post.privacy === "private" && <Lock className="size-4" />}
                    {post.privacy === "friends" && (
                      <Users2 className="size-4" />
                    )}
                  </span>
                  <span>
                    {new Date(post._creationTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Ellipsis className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Trash2 /> Delete
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pencil /> Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="whitespace-pre-wrap">{post.message}</p>
          <div className="grid grid-cols-3 gap-px mt-4">
            <Button
              variant="secondary"
              className=" text-muted-foreground rounded-r-none truncate"
            >
              <ThumbsUpIcon />
              <span>Like</span>
            </Button>
            <Button
              variant="secondary"
              className=" text-muted-foreground rounded-none truncate"
            >
              <MessageCircle />
              <span>Comment</span>
            </Button>
            <Button
              variant="secondary"
              className=" text-muted-foreground rounded-l-none truncate"
            >
              <Share2 />
              <span>Share</span>
            </Button>
          </div>
        </div>
      ))}
    </main>
  );
}
