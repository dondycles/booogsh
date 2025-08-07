import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { MessageCircle, Newspaper } from "lucide-react";
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
		<div className="flex flex-col relative">
			<div className="grid grid-cols-[1fr_minmax(0px,576px)_1fr] text-foreground relative z-0 [&>main]:data-[slot='unaffected-by-mobile-nav']:pb-19 [&>main]:data-[slot='affected-by-mobile-nav']:lg:h-dvh [&>main]:data-[slot='affected-by-mobile-nav']:h-[calc(100dvh-60px)] [&>main]:px-2 [&>main]:sm:px-4 [&>main]:pt-2 [&>main]:sm:pt-4 [&>main]:flex [&>main]:flex-col [&>main]:gap-2 [&>main]:sm:gap-4 [&>main]:max-w-xl [&>main]:w-full [&>main]:mx-auto [&>main]:col-start-2">
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
								{/* <Button
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
								</Button> */}
								<Button
									variant="ghost"
									asChild
									className="flex flex-row justify-baseline gap-2 h-fit text-foreground/75"
								>
									<Link href="/chat">
										<span>
											<MessageCircle className="size-8 shrink-0 " />
										</span>
										Chat
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
					<div className="flex items-center justify-center gap-4 max-w-xl mx-auto px-2 sm:px-4 h-full [&>a]:flex [&>a]:items-center [&>a]:justify-center [&>a]:size-9 [&>a]:rounded-full text-foreground/75">
						<Button variant="ghost" asChild size="icon">
							<Link href="/feed">
								<Newspaper className="shrink-0 size-5" />
							</Link>
						</Button>
						{/* <Button variant="ghost" asChild size="icon">
							<Link href="/feed">
								<Users2 className="shrink-0 size-5" />
							</Link>
						</Button> */}
						<Button variant="ghost" asChild size="icon">
							<Link href="/chat">
								<MessageCircle className="shrink-0 size-5" />
							</Link>
						</Button>
						<SignedIn>
							<CustomUserButton
								className="size-9 p-0 rounded-full"
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
