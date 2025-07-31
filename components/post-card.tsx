import { Doc } from "@/convex/_generated/dataModel";
import {
  Ellipsis,
  EyeOff,
  Globe2,
  Lock,
  MessageCircle,
  Pencil,
  Share2,
  ThumbsUpIcon,
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
      className="flex flex-col gap-4 bg-muted/25 rounded-md p-4"
    >
      <div className="flex place-items-start justify-between  text-muted-foreground gap-2">
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
      <p className="whitespace-pre-wrap">{post.message}</p>
      <div className="grid grid-cols-3 gap-px mt-4">
        <LikeButton currentUser={currentUser} post={post} />
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

function LikeButton({ post }: PostCardProps) {
  const handleToggleLikePost = useMutation(api.posts.toggleLike);
  const isLiked = post.likesCount.some(
    (like) => like.userId === post.user?._id,
  );
  return (
    <Button
      onClick={() => handleToggleLikePost({ postId: post._id })}
      variant="secondary"
      className=" text-muted-foreground rounded-r-none truncate"
    >
      <ThumbsUpIcon
        className={`${isLiked ? "text-foreground fill-foreground" : "text-muted-foreground"} `}
      />
      <span>
        {" "}
        {isLiked ? "Unlike" : "Like"}{" "}
        {post.likesCount.length ? `(${post.likesCount.length})` : null}
      </span>
    </Button>
  );
}
