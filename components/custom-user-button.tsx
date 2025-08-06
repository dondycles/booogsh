"use client";
import { UserProfile } from "@clerk/nextjs";
import { Moon, Sun, UserCircle2, UserCog2 } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { cn } from "@/lib/utils";
import Avatar from "./avatar";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import Username from "./username";

export default function CustomUserButton({
	className,
	variant = "ghost",
	asLink = false,
	showName = true,
}: {
	className?: string;
	variant?:
		| "link"
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| null
		| undefined;
	asLink?: boolean;
	showName?: boolean;
}) {
	const { setTheme, theme } = useTheme();
	const { user, isLoading } = useStoreUserEffect();
	if (isLoading)
		return (
			<Button
				variant={variant}
				className={cn(
					"flex flex-row gap-2 h-fit text-muted-foreground",
					className,
				)}
			>
				{showName ? <Skeleton className="w-20 h-4" /> : null}
				<span>
					<UserCircle2 className="size-9 shrink-0  animate-pulse" />
				</span>
			</Button>
		);
	if (asLink)
		return (
			<Button
				variant={variant}
				className={cn("flex flex-row gap-2 h-fit", className)}
				asChild
			>
				<Link
					href={`/user/${user?.username}`}
					className="flex items-center gap-2"
				>
					{showName ? <Username username={user?.username} disableLink /> : null}
					<Avatar user={user} size={32} disableLink />
				</Link>
			</Button>
		);
	return (
		<Dialog>
			<DropdownMenu>
				<DropdownMenuTrigger asChild className="px-3">
					<Button
						variant={variant}
						className={cn("flex flex-row gap-2 h-fit", className)}
					>
						{showName ? (
							<Username username={user?.username} disableLink />
						) : null}
						<Avatar user={user} size={32} disableLink />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="z-150">
					<DropdownMenuItem
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					>
						{theme === "dark" ? <Sun /> : <Moon />}
						{theme === "dark" ? "Light mode" : "Dark mode"}
					</DropdownMenuItem>
					<DialogTrigger asChild>
						<DropdownMenuItem>
							<UserCog2 /> User Settings
						</DropdownMenuItem>
					</DialogTrigger>
				</DropdownMenuContent>
			</DropdownMenu>
			<DialogContent
				showCloseButton={false}
				className="w-fit p-0  sm:max-w-none border-0"
			>
				<DialogHeader className="sr-only">
					<DialogTitle>User Profile</DialogTitle>
				</DialogHeader>
				<UserProfile routing="hash" />
			</DialogContent>
		</Dialog>
	);
}
