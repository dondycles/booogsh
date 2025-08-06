import type { Id } from "@/convex/_generated/dataModel";
import ChatRoomDeepViewClient from "./_chatRoomDeepViewClient";

export default async function ChatRoomDeepView({
	params,
}: {
	params: Promise<{ id: Id<"chatRoom"> }>;
}) {
	const { id } = await params;
	return <ChatRoomDeepViewClient id={id} />;
}
