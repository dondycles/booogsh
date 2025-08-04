import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { Globe2, Lock, Send, Users2 } from "lucide-react";
import { toast } from "sonner";
import { Doc } from "@/convex/_generated/dataModel";
import { ConvexError } from "convex/values";
export const sharePostSchema = z.object({
  message: z.string().trim().min(1, "Message is required"),
  privacy: z.enum(["public", "private", "friends"]),
});

export default function SharePostForm({
  post,
  close,
}: {
  post: Doc<"posts">;
  close?: () => void;
}) {
  const form = useForm<z.infer<typeof sharePostSchema>>({
    resolver: zodResolver(sharePostSchema),
    defaultValues: {
      message: post.message || "",
      privacy: post.privacy || "public",
    },
  });

  const editPost = useMutation(api.posts.update);
  const handleEditPost = async (data: z.infer<typeof sharePostSchema>) => {
    toast.loading("Editing post...", { id: data.message });
    try {
      await editPost({
        ...data,
        postId: post._id,
      });
      toast.dismiss(data.message);
      toast.success("Post edited successfully!");
      form.reset();
      if (close) {
        close();
      }
    } catch (error) {
      toast.dismiss(data.message);
      if (error instanceof ConvexError) {
        toast.error(error.message);
      } else {
        toast.error("Post could not be edited. Please try again.");
      }
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleEditPost)}
        className="flex flex-col gap-2 sm:gap-4 bg-muted rounded-md p-2 sm:p-4"
      >
        <FormField
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea {...field} placeholder="What's on your mind?" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 sm:gap-4 flex-wrap justify-between">
          <FormField
            control={form.control}
            name="privacy"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">
                      <Globe2 />
                      Public
                    </SelectItem>
                    <SelectItem value="private">
                      <Lock />
                      Private
                    </SelectItem>
                    <SelectItem value="friends">
                      <Users2 />
                      Friends
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={form.formState.isSubmitting} type="submit">
            <Send />
            Edit Post
          </Button>
        </div>
      </form>
    </Form>
  );
}
