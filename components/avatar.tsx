import { Doc } from "@/convex/_generated/dataModel";
import { UserCircle2 } from "lucide-react";
import Image from "next/image";

export default function Avatar({
  user,
  size = 40,
}: {
  user: Doc<"users"> | null;
  size?: number;
}) {
  return user?.pfp ? (
    <Image
      src={user?.pfp as string}
      alt={`${user?.username}'s profile picture`}
      width={size}
      height={size}
      quality={50}
      className="rounded-full"
    />
  ) : (
    <UserCircle2 className="size-10 shrink-0 text-foreground" />
  );
}
