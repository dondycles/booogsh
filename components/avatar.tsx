import { Doc } from "@/convex/_generated/dataModel";
import { UserCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Avatar({
  user,
  size = 40,
  disableLink = false,
}: {
  user: Doc<"users"> | null;
  size?: number;
  disableLink?: boolean;
}) {
  return user?.pfp ? (
    disableLink ? (
      <Image
        src={user.pfp as string}
        alt={`${user?.username}'s profile picture`}
        width={size}
        height={size}
        quality={50}
        className="rounded-full size-fit"
      />
    ) : (
      <Link href={`/user/${user.username}`}>
        <Image
          src={user?.pfp as string}
          alt={`${user?.username}'s profile picture`}
          width={size}
          height={size}
          quality={50}
          className="rounded-full size-fit"
        />
      </Link>
    )
  ) : (
    <UserCircle2 className="size-10 shrink-0 text-foreground" />
  );
}
