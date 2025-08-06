import Link from "next/link";
import { cn } from "@/lib/utils";

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
			<span className={cn("text-sm font-semibold text-foreground", className)}>
				{showAtSymbol ? "@" : null}
				{username ?? "no-username"}
			</span>
		);
	return (
		<Link href={`/user/${username}`}>
			<span className={cn("text-sm font-semibold text-foreground", className)}>
				{showAtSymbol ? "@" : null}
				{username ?? "no-username"}
				{showYou ? " (You)" : null}
			</span>
		</Link>
	);
}
