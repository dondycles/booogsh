import { Doc } from "@/convex/_generated/dataModel";
import {
  Ellipsis,
  EyeOff,
  Globe2,
  Heart,
  Lock,
  MessageSquare,
  Pencil,
  Share2,
  Trash2,
  UserCircle2,
  Users2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

interface PostCardProps {
  post: Doc<"posts"> & {
    user: Doc<"users"> | null;
    likesCount: Doc<"likes">[];
  };
  currentUser: Doc<"users"> | null;
}

export default function PostCard({ post, currentUser }: PostCardProps) {
  return (
    <div
      key={post._id}
      className="flex flex-col gap-2 sm:gap-4 bg-muted rounded-md pt-2 sm:pt-4"
    >
      <div className="flex place-items-start justify-between  text-muted-foreground gap-2  px-2 sm:px-4 ">
        <div className="flex gap-2 items-start truncate">
          {post.user?.pfp ? (
            <Image
              src={post.user?.pfp as string}
              alt={`${post.user?.username}'s profile picture`}
              width={40}
              height={40}
              quality={50}
              className="rounded-full"
            />
          ) : (
            <UserCircle2 className="size-10 shrink-0 text-foreground" />
          )}
          <div className="space-y-1 inline-flex flex-col">
            <span className="text-sm font-semibold">
              {post.user?.username === currentUser?.username
                ? `${post.user?.username} (You)`
                : post.user?.username}
            </span>
            <div className="text-xs space-x-1 inline-flex">
              <span>
                {post.privacy === "public" && <Globe2 className="size-4" />}
                {post.privacy === "private" && <Lock className="size-4" />}
                {post.privacy === "friends" && <Users2 className="size-4" />}
              </span>
              <span>{new Date(post._creationTime).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <PostOptions currentUser={currentUser} post={post} />
      </div>
      <p className="whitespace-pre-wrap text-sm sm:text-base text-foreground  px-2 sm:px-4 ">
        {post.message}
      </p>

      <div className="grid grid-cols-3 gap-px mt-4 h-10 bg-accent/30 rounded-b-md">
        <LikeButton currentUser={currentUser} post={post} />
        <Button
          variant="ghost"
          className=" text-muted-foreground rounded-none truncate h-full"
        >
          <span>
            <MessageSquare />
          </span>
        </Button>
        <Button
          variant="ghost"
          className=" text-muted-foreground rounded-none  rounded-br-md truncate  h-full"
        >
          <span>
            <Share2 />
          </span>
        </Button>
      </div>
    </div>
  );
}

function PostOptions({ post, currentUser }: PostCardProps) {
  const handleRemovePost = useMutation(api.posts.remove);
  if (!currentUser) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Ellipsis className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleRemovePost({ postId: post._id })}
          hidden={currentUser?._id !== post.user?._id}
        >
          <Trash2 /> Delete
        </DropdownMenuItem>
        <DropdownMenuItem hidden={currentUser?._id !== post.user?._id}>
          <Pencil /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem hidden={currentUser?._id === post.user?._id}>
          <EyeOff /> Hide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LikeButton({ post, currentUser }: PostCardProps) {
  const handleToggleLikePost = useMutation(api.posts.toggleLike);
  const isLiked = post.likesCount.some(
    (like) => like.userId === currentUser?._id,
  );
  return (
    <Button
      onClick={() => handleToggleLikePost({ postId: post._id })}
      variant="ghost"
      className=" text-muted-foreground rounded-none rounded-bl-md truncate h-full"
    >
      <span>
        <Heart
          className={`text-muted-foreground ${isLiked ? "fill-muted-foreground" : ""} `}
        />
      </span>
      {post.likesCount.length ? <span>{post.likesCount.length}</span> : null}
    </Button>
  );
}
