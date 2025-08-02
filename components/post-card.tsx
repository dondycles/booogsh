import { Doc, Id } from "@/convex/_generated/dataModel";
import {
  Ellipsis,
  EyeOff,
  Globe2,
  Heart,
  Lock,
  MessageSquare,
  Pencil,
  Send,
  Share2,
  Trash2,
  Users2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation, usePaginatedQuery } from "convex/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import z from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import Avatar from "./avatar";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import ConfirmDialog from "./comfirm-dialog";
import { useState } from "react";
export const commentSchema = z.object({
  postId: z.custom<Id<"posts">>(),
  content: z.string().min(1).max(500),
});

interface PostCardProps {
  post: Doc<"posts"> & {
    user: Doc<"users"> | null;
    isLiked: boolean;
  };
  currentUser: Doc<"users"> | null;
}

export default function PostCard({
  post,
  currentUser,
  isDisabledComments = false,
  className,
}: PostCardProps & { isDisabledComments?: boolean; className?: string }) {
  return (
    <div
      key={post._id}
      className={cn(
        "flex flex-col gap-2 sm:gap-4 bg-muted rounded-md pt-2 sm:pt-4",
        className,
      )}
    >
      <div className="flex place-items-start justify-between  text-muted-foreground gap-2  px-2 sm:px-4 ">
        <div className="flex gap-2 items-start truncate">
          <Avatar user={post.user} />
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
      <h1 className="whitespace-pre-wrap text-sm sm:text-base text-foreground px-2 sm:px-4 ">
        {post.message}
      </h1>

      <div className="flex [&>*]:flex-1 gap-px mt-4 h-10 bg-accent/30 rounded-b-md">
        <LikeButton currentUser={currentUser} post={post} />
        {isDisabledComments ? null : (
          <PostDialog post={post} currentUser={currentUser}>
            <Button
              variant="ghost"
              className=" text-muted-foreground rounded-none truncate h-full"
            >
              <span>
                <MessageSquare />
              </span>
              {post.commentsCount ? <span>{post.commentsCount}</span> : null}
            </Button>
          </PostDialog>
        )}
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
  const [open, setOpen] = useState(false);
  const removePost = useMutation(api.posts.remove);
  const handleRemovePost = async () => {
    const res = await removePost({ postId: post._id });
    if (res !== true) return toast.error(res);
    setOpen(false);
  };
  if (!currentUser) return null;
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <Ellipsis className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ConfirmDialog
          confirm={() => {
            void handleRemovePost();
          }}
          title="Remove Post"
          description="Are you sure you want to remove this post? This action cannot be undone."
        >
          <DropdownMenuItem
            hidden={currentUser?._id !== post.user?._id}
            disabled={currentUser?._id !== post.user?._id}
            onSelect={(e) => e.preventDefault()}
          >
            <Trash2 /> Delete
          </DropdownMenuItem>
        </ConfirmDialog>
        <DropdownMenuItem
          hidden={currentUser?._id !== post.user?._id}
          disabled={currentUser?._id !== post.user?._id}
        >
          <Pencil /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          hidden={currentUser?._id === post.user?._id}
          disabled={currentUser?._id === post.user?._id}
        >
          <EyeOff /> Hide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LikeButton({ post }: PostCardProps) {
  const toggleLikePost = useMutation(api.likes.toggleLikePost);
  const handleToggleLikePost = async () => {
    const res = await toggleLikePost({ postId: post._id });
    if (res !== true) return toast.error(res);
  };
  return (
    <Button
      onClick={() => void handleToggleLikePost()}
      variant="ghost"
      className=" text-muted-foreground rounded-none rounded-bl-md truncate h-full"
    >
      <span>
        <Heart
          className={`text-muted-foreground ${post.isLiked ? "fill-muted-foreground" : ""} `}
        />
      </span>
      {post.likesCount ? <span>{post.likesCount}</span> : null}
    </Button>
  );
}

function CommentForm({ post }: PostCardProps) {
  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
      postId: post._id,
    },
  });

  const addComment = useMutation(api.comments.add);
  const handleAddComment = async (data: z.infer<typeof commentSchema>) => {
    const res = await addComment(data);
    if (res !== true) return toast.error(res);
    form.reset();
  };
  return (
    <Form {...form}>
      <form
        className="flex flex-row gap-2 sm:gap-4"
        onSubmit={form.handleSubmit(handleAddComment)}
      >
        <FormField
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea {...field} placeholder="Add a comment..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="ml-auto mr-0"
          size="icon"
        >
          <Send />
        </Button>
      </form>
    </Form>
  );
}

function PostDialog({
  post,
  currentUser,
  children,
}: PostCardProps & { children: React.ReactNode }) {
  const {
    isLoading: isLoadingMoreComments,
    loadMore: loadMoreComments,
    results: comments,
    status: commentsStatus,
  } = usePaginatedQuery(
    api.comments.getPublicPostComments,
    { postId: post._id },
    { initialNumItems: 6 },
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className=" max-w-xl sm:max-w-xl p-2 sm:p-4 bg-transparent overflow-hidden border-0 shadow-none"
      >
        <ScrollArea>
          <div className="flex flex-col gap-2 sm:gap-4 h-[60dvh] relative backdrop-blur  bg-background/50 rounded-md border">
            <DialogHeader className="sr-only">
              <DialogTitle>Comments</DialogTitle>
            </DialogHeader>
            <PostCard
              currentUser={currentUser}
              post={post}
              isDisabledComments
              className="rounded-b-none border-b"
            />
            <p className="text-sm sm:text-base font-semibold text-muted-foreground px-2 sm:px-4">
              Comments {post.commentsCount ? `(${post.commentsCount})` : null}
            </p>
            {comments.length ? (
              <div className="flex flex-col gap-2 sm:gap-4 px-2 sm:px-4">
                {comments.map((comment) => (
                  <CommentCard
                    key={comment._id}
                    comment={comment}
                    postId={post._id}
                  />
                ))}
                <Button
                  hidden={commentsStatus !== "CanLoadMore"}
                  onClick={() => loadMoreComments(5)}
                  disabled={
                    commentsStatus !== "CanLoadMore" || isLoadingMoreComments
                  }
                  className="text-muted-foreground"
                  variant="secondary"
                >
                  Load more comments?
                </Button>
              </div>
            ) : null}

            <div className="sticky bottom-0 left-0 right-0 bg-muted rounded-b-md mb-0 mt-auto border-t p-2 sm:p-4">
              <CommentForm currentUser={currentUser} post={post} />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function CommentCard({
  comment,
  postId,
}: {
  comment: Doc<"comments"> & {
    user: Doc<"users"> | null;
    isMyComment: boolean;
    isMyPost: boolean;
    isLiked: boolean;
  };
} & {
  postId: Id<"posts">;
}) {
  const removeComment = useMutation(api.comments.remove);
  const toggleLike = useMutation(api.likes.toggleLikeComment);
  const handleRemoveComment = async () => {
    const res = await removeComment({ commentId: comment._id, postId });
    if (res !== true) return toast.error(res);
  };
  const handleToggleLike = async () => {
    const res = await toggleLike({ commentId: comment._id });
    if (res !== true) return toast.error(res);
  };
  return (
    <div
      key={comment._id}
      className="inline-flex gap-2 items-start p-2 sm:p-4 bg-muted rounded-md"
    >
      <Avatar user={comment.user} size={32} />
      <div className="text-sm flex-1 space-y-1">
        <p className="text-muted-foreground whitespace-pre-wrap">
          {comment.user?.username}
        </p>
        <p>{comment.content}</p>
        <div className="text-xs flex flex-wrap-reverse gap-x-4 gap-y-2 justify-between text-muted-foreground mt-3">
          <div className="flex gap-4 truncate [&>button]:hover:underline">
            <button onClick={() => void handleToggleLike()}>
              {comment.isLiked ? "Unlike" : "Like"}{" "}
              {comment.likesCount ? `(${comment.likesCount})` : null}
            </button>
            <button>Reply</button>
            <button hidden={!comment.isMyComment} className="text-yellow-600">
              Edit
            </button>
            <ConfirmDialog
              title="Remove Comment"
              description="Are you sure you want to remove this comment? This action cannot be undone."
              confirm={() => void handleRemoveComment()}
            >
              <button
                hidden={!comment.isMyComment && !comment.isMyPost}
                className="text-destructive"
              >
                Remove
              </button>
            </ConfirmDialog>
          </div>
          <p className="text-xs">
            {new Date(comment._creationTime).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
