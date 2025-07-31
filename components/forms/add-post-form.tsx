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
export const postSchema = z.object({
  message: z.string().trim().min(1, "Message is required"),
  privacy: z.enum(["public", "private", "friends"]),
});

export default function AddPostForm() {
  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      message: "",
      privacy: "public",
    },
  });

  const handleAddPost = useMutation(api.posts.add);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          const res = await handleAddPost(data);
          if (res) {
            form.reset();
          }
        })}
        className="flex flex-col gap-4 bg-muted/25 rounded-md p-4"
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
        <div className="flex gap-4 flex-wrap justify-between">
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
            Post
          </Button>
        </div>
      </form>
    </Form>
  );
}
