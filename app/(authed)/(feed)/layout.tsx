import CustomUserButton from "@/components/custom-user-button";
import IsMobile from "@/components/is-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignedIn } from "@clerk/nextjs";
import { Dot, Ellipsis, MessageCircle, Users2 } from "lucide-react";
import Link from "next/link";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_minmax(0px,576px)_1fr] bg-background text-foreground relative z-0">
      <IsMobile MOBILE_BREAKPOINT={1024}>
        <SignedIn>
          <div className="fixed bottom-0 left-0 h-[calc(100vh-60px)] w-[calc((100vw-590px)/2)] flex flex-col p-2 sm:p-4 ">
            <CustomUserButton
              asLink
              className="flex-row-reverse justify-end text-base font-semibold"
            />
            <Button
              variant="ghost"
              asChild
              className="flex flex-row justify-baseline gap-2 h-fit text-foreground/75"
            >
              <Link href="/feed">
                <span>
                  <Users2 className="size-8 shrink-0 " />
                </span>
                Friends
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="flex flex-row justify-baseline gap-2 h-fit text-foreground/75"
            >
              <Link href="/feed">
                <span>
                  <MessageCircle className="size-8 shrink-0 " />
                </span>
                Chats
              </Link>
            </Button>
          </div>
        </SignedIn>
      </IsMobile>
      {children}
      <IsMobile MOBILE_BREAKPOINT={1024}>
        <SignedIn>
          <div className="fixed bottom-0 right-0 h-[calc(100vh-60px)] w-[calc((100vw-590px)/2)] flex flex-col p-2 sm:p-4 ">
            <div className="border-b pb-2 inline-flex items-center justify-between gap-2">
              <div className="font-semibold text-muted-foreground inline-flex truncate">
                <span>
                  <Dot className="text-green-600 stroke-6" />
                </span>
                <span>Online Friends</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-muted-foreground">
                    <Ellipsis className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Set Active Status</DropdownMenuItem>
                  <DropdownMenuItem>Hide Online Friends</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SignedIn>
      </IsMobile>
    </div>
  );
}
