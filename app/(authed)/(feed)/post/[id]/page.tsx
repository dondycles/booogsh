import PostDeepViewClient from "./postDeepViewClient";
import { Id } from "@/convex/_generated/dataModel";

export default async function PostDeepView({
  params,
}: {
  params: Promise<{ id: Id<"posts"> }>;
}) {
  const { id } = await params;
  return (
    <main className="p-2 sm:p-4 flex flex-col gap-2 sm:gap-4 max-w-xl w-full mx-auto lg:col-start-2">
      <PostDeepViewClient postId={id} />
    </main>
  );
}
