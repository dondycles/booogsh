import { UserCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import * as UserDotStatus from "./user-dot-status";

export default function Avatar({
	user,
	size = 40,
	disableLink = false,
	showDotStatus = false,
	showDotStatusTooltip = false,
	dotStatusClassName,
	dotStatusTooltipClassName,
}: {
	user: Doc<"users"> | null;
	size?: number;
	disableLink?: boolean;
	showDotStatus?: boolean;
	dotStatusClassName?: string;
	dotStatusTooltipClassName?: string;
	showDotStatusTooltip?: boolean;
}) {
	return user?.pfp ? (
		disableLink ? (
			<div className="relative  shrink-0">
				<Image
					src={user.pfp as string}
					alt={`${user?.username}'s profile picture`}
					width={size}
					height={size}
					quality={50}
					className="rounded-full size-fit"
				/>
				{showDotStatus ? (
					<div
						className={cn(
							"absolute bottom-0 right-0 aspect-square size-auto grid bg-muted rounded-full",
							dotStatusClassName,
						)}
					>
						<UserDotStatus.Context
							value={{
								lastActivity: user.lastActivity,
								activityStatus: user.activityStatus,
							}}
						>
							{showDotStatusTooltip ? (
								<UserDotStatus.Tooltip className={dotStatusTooltipClassName}>
									<UserDotStatus.Dot
										className={cn(
											"h-full w-full stroke-12",
											dotStatusClassName,
										)}
									/>
								</UserDotStatus.Tooltip>
							) : (
								<UserDotStatus.Dot
									className={cn("h-full w-full stroke-12", dotStatusClassName)}
								/>
							)}
						</UserDotStatus.Context>
					</div>
				) : null}
			</div>
		) : (
			<div className="relative shrink-0">
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
				{showDotStatus ? (
					<div
						className={cn(
							"absolute bottom-0 right-0 aspect-square size-auto grid bg-muted rounded-full",
							dotStatusClassName,
						)}
					>
						<UserDotStatus.Context
							value={{
								lastActivity: user.lastActivity,
								activityStatus: user.activityStatus,
							}}
						>
							{showDotStatusTooltip ? (
								<UserDotStatus.Tooltip className={dotStatusTooltipClassName}>
									<UserDotStatus.Dot
										className={cn(
											"h-full w-full stroke-12",
											dotStatusClassName,
										)}
									/>
								</UserDotStatus.Tooltip>
							) : (
								<UserDotStatus.Dot
									className={cn("h-full w-full stroke-12", dotStatusClassName)}
								/>
							)}
						</UserDotStatus.Context>
					</div>
				) : null}
			</div>
		)
	) : (
		<UserCircle2 className="size-9 shrink-0 text-muted-foreground" />
	);
}
