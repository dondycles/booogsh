import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Globe2, Lock, Send, Users2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
export const postSchema = z.object({
	message: z.string().trim().min(1, "Message is required"),
	privacy: z.enum(["public", "private", "friends"]),
	sharedPostId: z.custom<Id<"posts">>().optional(),
});

export default function AddPostForm({
	className,
	close,
	sharedPostId,
}: {
	className?: string;
	close?: () => void;
	sharedPostId?: Id<"posts">;
}) {
	const form = useForm<z.infer<typeof postSchema>>({
		resolver: zodResolver(postSchema),
		defaultValues: {
			message: "",
			privacy: "public",
			sharedPostId,
		},
	});

	const handleAddPost = useMutation(api.posts.add);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(async (data) => {
					toast.loading("Adding post...", { id: data.message });
					const res = await handleAddPost(data);
					toast.dismiss(data.message);
					if (res) {
						toast.success("Post added successfully!");
						form.reset();
						if (close) {
							close();
						}
						return;
					}
					toast.warning("Post could not be added. Please try again.");
				})}
				className={cn(
					"flex flex-col gap-2 sm:gap-4 bg-muted rounded-md p-2 sm:p-4",
					className,
				)}
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
						Post
					</Button>
				</div>
			</form>
		</Form>
	);
}
