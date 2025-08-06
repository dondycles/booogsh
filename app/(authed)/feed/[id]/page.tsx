import type { Id } from "@/convex/_generated/dataModel";
import PostDeepViewClient from "./_postDeepViewClient";

export default async function PostDeepView({
	params,
}: {
	params: Promise<{ id: Id<"posts"> }>;
}) {
	const { id } = await params;
	return (
		<main data-slot="unaffected-by-mobile-nav">
			<PostDeepViewClient postId={id} />
		</main>
	);
}
