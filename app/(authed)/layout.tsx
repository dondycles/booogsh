import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { MessageCircle, Newspaper, Users2 } from "lucide-react";
import Link from "next/link";
import CustomUserButton from "@/components/custom-user-button";
import Friends from "@/components/friends";
import IsMobile from "@/components/is-mobile";
import LastActivitySetter from "@/components/last-activity-setter";
import { Button } from "@/components/ui/button";

export default function AuthedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col relative ">
			<div className="grid grid-cols-[1fr_minmax(0px,576px)_1fr] text-foreground relative z-0">
				<IsMobile MOBILE_BREAKPOINT={1024}>
					<SignedIn>
						<div className="fixed bottom-0 left-0 h-dvh w-[calc((100vw-590px)/2)] flex items-start justify-end">
							<div className="flex flex-col p-2 sm:p-4 max-w-sm w-full ">
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
											<Newspaper className="size-8 shrink-0 " />
										</span>
										Feed
									</Link>
								</Button>
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
						</div>
					</SignedIn>
				</IsMobile>
				{children}
				<IsMobile MOBILE_BREAKPOINT={1024}>
					<SignedIn>
						<Friends />
					</SignedIn>
				</IsMobile>
			</div>
			<IsMobile MOBILE_BREAKPOINT={1024} reverse>
				<nav className="bg-muted w-full fixed bottom-0 h-[60px] z-1 border-t">
					<div className="flex items-center justify-between gap-4 max-w-xl mx-auto p-4 h-full">
						<Link href="/feed">
							<span className="font-semibold text-sm">booog.sh</span>
						</Link>
						<SignedIn>
							<CustomUserButton
								className="h-9 p-0 rounded-full"
								showName={false}
							/>
						</SignedIn>
						<SignedOut>
							<Button asChild>
								<SignInButton />
							</Button>
						</SignedOut>
					</div>
				</nav>
			</IsMobile>
			<LastActivitySetter />
		</div>
	);
}
