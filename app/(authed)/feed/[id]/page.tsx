import type { Id } from "@/convex/_generated/dataModel";
import PostDeepViewClient from "./_postDeepViewClient";

export default async function PostDeepView({
	params,
}: {
	params: Promise<{ id: Id<"posts"> }>;
}) {
	const { id } = await params;
	return (
		<main className="px-2 sm:px-4 pt-2 sm:pt-4 pb-24 flex flex-col gap-2 sm:gap-4 max-w-xl w-full mx-auto col-start-2 ">
			<PostDeepViewClient postId={id} />
		</main>
	);
}
