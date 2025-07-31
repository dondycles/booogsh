"use client";
import { UserProfile } from "@clerk/nextjs";
import { Moon, Sun, UserCircle2, UserCog2 } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import Image from "next/image";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";

export default function CustomUserButton({
  className,
  variant = "ghost",
  asLink = false,
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
        <Skeleton className="w-20 h-4" />
        <span>
          <UserCircle2 className="size-8 shrink-0  animate-pulse" />
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
        <Link href={`/u/${user?.username}`} className="flex items-center gap-2">
          <p>{user?.username}</p>
          {user?.pfp ? (
            <Image
              src={user?.pfp}
              alt={user?.username + "'s profile picture"}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <UserCircle2 className="size-5 shrink-0 text-foreground" />
          )}
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
            <p>{user?.username}</p>
            {user?.pfp ? (
              <Image
                src={user?.pfp}
                alt={user?.username + "'s profile picture"}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <UserCircle2 className="size-5 shrink-0 text-foreground" />
            )}
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
              <UserCog2 /> Settings
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
