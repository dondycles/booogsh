import { Doc, Id } from "@/convex/_generated/dataModel";
import {
  CornerDownRight,
  Ellipsis,
  EyeOff,
  Globe2,
  Heart,
  Lock,
  MessageSquare,
  Pencil,
  Send,
  Share2,
  Slash,
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
import React, { useState } from "react";
export const commentSchema = z.object({
  postId: z.custom<Id<"posts">>(),
  commentId: z.optional(z.custom<Id<"postComments">>()),
  content: z.string().min(1).max(500),
});
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import EditPostForm from "./forms/edit-post-form";
import { ConvexError } from "convex/values";
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
    try {
      await removePost({ postId: post._id });
      setOpen(false);
    } catch (error) {
      error instanceof ConvexError
        ? toast.error(error.message)
        : toast.error("Post could not be removed. Please try again.");
    }
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
        <EditFormDialog
          currentUser={currentUser}
          post={post}
          confirm={() => setOpen(false)}
        >
          <DropdownMenuItem
            hidden={currentUser?._id !== post.user?._id}
            disabled={currentUser?._id !== post.user?._id}
            onSelect={(e) => e.preventDefault()}
          >
            <Pencil /> Edit
          </DropdownMenuItem>
        </EditFormDialog>
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
    try {
      await toggleLikePost({ postId: post._id });
    } catch (error) {
      error instanceof ConvexError
        ? toast.error(error.message)
        : toast.error("Post could not be liked. Please try again.");
    }
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

function CommentForm({
  post,
  currentUser,
  comment,
  close,
}: PostCardProps & {
  comment?: Doc<"postComments"> | null;
  close?: () => void;
}) {
  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
      postId: post._id,
      commentId: comment?._id,
    },
  });

  const addComment = useMutation(api.postComments.add);
  const handleAddComment = async (data: z.infer<typeof commentSchema>) => {
    try {
      await addComment(data);
      form.reset();
      if (close) close();
    } catch (error) {
      error instanceof ConvexError
        ? toast.error(error.message)
        : toast.error("Comment could not be added. Please try again.");
    }
  };
  return (
    <Form {...form}>
      <form
        className="flex gap-2 flex-1"
        onSubmit={form.handleSubmit(handleAddComment)}
      >
        <Avatar user={currentUser} size={32} />
        <div className="flex flex-row gap-2 flex-1">
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
        </div>
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
    api.postComments.getPublicPostComments,
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
                    post={post}
                    currentUser={currentUser}
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
  post,
  currentUser,
  className,
  parentCommentId,
}: PostCardProps & {
  comment: Doc<"postComments"> & {
    user: Doc<"users"> | null;
    isMyComment: boolean;
    isMyPost: boolean;
    isLiked: boolean;
  };
  className?: string;
  parentCommentId?: Id<"postComments">;
}) {
  const { results: childCommentsResults } = usePaginatedQuery(
    api.postComments.getChildComments,
    { postId: post._id, commentId: comment._id },
    { initialNumItems: 3 },
  );
  const [collapseForm, setCollapseForm] = useState(false);
  const removeComment = useMutation(api.postComments.remove);
  const toggleLike = useMutation(api.likes.toggleLikeComment);
  const handleRemoveComment = async () => {
    try {
      await removeComment({
        commentId: comment._id,
        postId: post._id,
        parentCommentId,
      });
    } catch (error) {
      error instanceof ConvexError
        ? toast.error(error.message)
        : toast.error("Comment could not be removed. Please try again.");
    }
  };
  const handleToggleLike = async () => {
    try {
      await toggleLike({ commentId: comment._id });
    } catch (error) {
      error instanceof ConvexError
        ? toast.error(error.message)
        : toast.error("Comment could not be liked. Please try again.");
    }
  };
  return (
    <div
      key={comment._id}
      className={cn(
        "inline-flex gap-2 items-start p-2 sm:p-4 bg-muted rounded-md",
        className,
      )}
    >
      <Avatar user={comment.user} size={32} />
      <div className="text-sm flex-1 space-y-1">
        <p className="text-muted-foreground whitespace-pre-wrap">
          {comment.user?.username}
        </p>
        <p>{comment.content}</p>
        <Collapsible open={collapseForm} onOpenChange={setCollapseForm}>
          <div className="text-xs flex flex-wrap-reverse gap-x-4 gap-y-2 justify-between text-muted-foreground mt-3">
            <div className="flex gap-4 truncate [&>button]:hover:underline">
              <button onClick={() => void handleToggleLike()}>
                {comment.isLiked ? "Unlike" : "Like"}{" "}
                {comment.likesCount ? `(${comment.likesCount})` : null}
              </button>
              <CollapsibleTrigger asChild>
                <button>
                  Reply{" "}
                  {comment.commentsCount ? `(${comment.commentsCount})` : null}
                </button>
              </CollapsibleTrigger>
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
          <CollapsibleContent className="mt-2 sm:mt-4 flex gap-2 w-full relative">
            <div className="absolute -left-7 -top-5 flex flex-col items-center justify-center ">
              <Slash className="text-muted-foreground/25 -rotate-45 -translate-x-2 -translate-y-4" />
              <CornerDownRight className="text-muted-foreground/25" />
            </div>
            <CommentForm
              currentUser={currentUser}
              post={post}
              comment={comment}
              close={() => setCollapseForm(false)}
            />
          </CollapsibleContent>
        </Collapsible>
        {childCommentsResults.length ? (
          <div className="flex flex-col gap-2 mt-4">
            {childCommentsResults.map((childComment) => (
              <div key={childComment._id} className="relative">
                <div className="absolute -left-7 -top-5 flex flex-col items-center justify-center ">
                  <Slash className="text-muted-foreground/25 -rotate-45 -translate-x-2 -translate-y-4" />
                  <CornerDownRight className="text-muted-foreground/25" />
                </div>
                <CommentCard
                  className="p-0 sm:p-0 w-full"
                  comment={childComment}
                  post={post}
                  currentUser={currentUser}
                  parentCommentId={comment._id}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EditFormDialog({
  post,
  children,
  confirm,
}: PostCardProps & { children: React.ReactNode; confirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className=" max-w-xl sm:max-w-xl p-2 sm:p-4 bg-transparent overflow-hidden border-0 shadow-none"
      >
        <ScrollArea>
          <div className="flex flex-col gap-2 sm:gap-4 h-[60dvh] relative backdrop-blur  bg-background/50 rounded-md border">
            <DialogHeader className="px-2 sm:px-4 pt-2 sm:pt-4">
              <DialogTitle>Edit post</DialogTitle>
            </DialogHeader>
            <EditPostForm
              post={post}
              close={() => {
                setOpen(false);
                confirm();
              }}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
