import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "../ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";

export const SendChatFormSchema = z.object({
	content: z.string().min(1, "Message cannot be empty").trim(),
});

export default function SendChatForm({
	chatRoomId,
}: {
	chatRoomId: Id<"chatRoom">;
}) {
	const form = useForm<z.infer<typeof SendChatFormSchema>>({
		resolver: zodResolver(SendChatFormSchema),
		defaultValues: {
			content: "",
		},
	});

	const sendChat = useMutation(api.chat.sendChat);
	const handleSubmitSendChat = async (
		data: z.infer<typeof SendChatFormSchema>,
	) => {
		await sendChat({ content: data.content, chatRoomId });
		form.reset();
	};

	return (
		<Form {...form}>
			<form
				className="flex gap-2 sm:gap-4"
				onSubmit={form.handleSubmit(handleSubmitSendChat)}
			>
				<FormField
					name="content"
					render={({ field }) => (
						<FormItem className="flex-1">
							<FormControl>
								<Textarea {...field} placeholder="Type something..." />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					disabled={!form.formState.isValid || form.formState.isSubmitting}
					size="icon"
				>
					<Send />
				</Button>
			</form>
		</Form>
	);
}
