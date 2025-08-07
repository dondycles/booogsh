import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { compact } from "lodash";
import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

export default function Chats({
	chatRoomData,
}: {
	chatRoomData: Doc<"chatRoom"> & {
		partiesData: Array<Doc<"users"> | null>;
		curretUserDbData: Doc<"users">;
	};
}) {
	const [initialized, setInitialized] = useState(false);

	const {
		results: chats,
		isLoading: isLoadingMoreChats,
		loadMore: loadMoreChats,
		status: chatsStatus,
	} = usePaginatedQuery(
		api.chat.getChats,
		{ chatRoomId: chatRoomData._id },
		{ initialNumItems: 20 },
	);

	const handleSeenChat = useMutation(api.chat.seenChat);
	const lastSeens = useQuery(api.chat.getLastMessageSeen, {
		chatRoomId: chatRoomData._id,
		partiesIds: compact(chatRoomData.partiesData.map((p) => p?._id)),
	});

	const bottomRef = useRef<HTMLDivElement | null>(null);
	const loadMoreRef = useRef<HTMLDivElement | null>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);
	const loadMoreObserverRef = useRef<IntersectionObserver | null>(null);

	const [isAtBottom, setIsAtBottom] = useState(false);

	useEffect(() => {
		if (!bottomRef.current) return;

		observerRef.current = new IntersectionObserver(
			([entry]) => {
				setIsAtBottom(entry.isIntersecting);
				setInitialized(true);
			},
			{
				root: document.querySelector("[data-scrollarea-viewport]") || undefined,
				threshold: 1.0,
			},
		);

		observerRef.current.observe(bottomRef.current);

		return () => {
			observerRef.current?.disconnect();
		};
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <basta>
	useEffect(() => {
		if (isAtBottom && bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: "instant" });
			if (chats.length > 0 && !document.hidden) {
				handleSeenChat({
					chatRoomId: chatRoomData._id,
					messageId: chats[0]._id,
				});
			}
		}
	}, [chats.length, isAtBottom, bottomRef.current]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <basta>
	useEffect(() => {
		if (!loadMoreRef.current || chatsStatus !== "CanLoadMore" || !initialized)
			return;

		loadMoreObserverRef.current = new IntersectionObserver(
			([entry]) => {
				if (
					entry.isIntersecting &&
					chatsStatus === "CanLoadMore" &&
					!isLoadingMoreChats
				) {
					loadMoreChats(20);
				}
			},
			{
				root: document.querySelector("[data-scrollarea-viewport]") || undefined,
				threshold: 1.0,
			},
		);

		loadMoreObserverRef.current.observe(loadMoreRef.current);

		return () => {
			loadMoreObserverRef.current?.disconnect();
		};
	}, [chatsStatus, isLoadingMoreChats, initialized]);

	return (
		<ScrollArea className="grid overflow-auto rounded-md h-full">
			<div className="flex flex-col justify-end gap-y-2 sm:gap-y-4 rounded-md py-2 sm:py-4 flex-1 mt-auto mb-0">
				<div
					ref={loadMoreRef}
					hidden={chatsStatus !== "CanLoadMore"}
					className="text-muted-foreground text-sm text-center"
				>
					{isLoadingMoreChats ? "Loading more chats..." : "Load more chats?"}
				</div>
				{chats?.toReversed().map((chat) => (
					<div
						key={chat._id}
						className={`flex gap-2 text-sm w-fit ${
							chat.userId === chatRoomData.curretUserDbData._id
								? "self-end flex-row-reverse"
								: "self-start flex-row"
						}`}
					>
						<Avatar
							user={
								chat.userId === chatRoomData.curretUserDbData._id
									? chatRoomData.curretUserDbData
									: (chatRoomData.partiesData.find(
											(p) => p?._id === chat.userId,
										) ?? null)
							}
							size={24}
						/>

						<div className="bg-muted max-w-md rounded-md p-2 sm:p-4 border">
							<span className="whitespace-pre-wrap">{chat.content}</span>
							<div
								className={`flex gap-1 flex-wrap mt-2 ${
									chat.userId === chatRoomData.curretUserDbData._id
										? "justify-end"
										: "justify-start"
								}`}
							>
								{lastSeens?.some((lp) => lp.messageId === chat._id) &&
									lastSeens
										.filter((lp) => lp.messageId === chat._id)
										.map((lp) => (
											<Avatar
												key={lp.userId}
												user={
													chatRoomData.partiesData.find(
														(p) => p?._id === lp.userId,
													) ?? null
												}
												size={16}
											/>
										))}
							</div>
						</div>
					</div>
				))}

				<div ref={bottomRef} className="-mb-2 sm:-mb-4" />
			</div>
		</ScrollArea>
	);
}
