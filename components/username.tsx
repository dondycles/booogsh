import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Username({
  username,
  disableLink,
  className,
  showAtSymbol = false,
  showYou = false,
}: {
  username?: string;
  disableLink?: boolean;
  className?: string;
  showAtSymbol?: boolean;
  showYou?: boolean;
}) {
  if (disableLink || !username)
    return (
      <p className={cn("text-muted-foreground", className)}>
        {showAtSymbol ? "@" : null}
        {username ?? "no-username"}
      </p>
    );
  return (
    <Link href={`/user/${username}`}>
      <span className={cn("text-muted-foreground", className)}>
        {showAtSymbol ? "@" : null}
        {username ?? "no-username"}
        {showYou ? " (You)" : null}
      </span>
    </Link>
  );
}
