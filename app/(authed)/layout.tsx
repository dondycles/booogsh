import CustomUserButton from "@/components/custom-user-button";
import LastActivitySetter from "@/components/last-activity-setter";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col relative">
      <header className="bg-muted w-full sticky top-0 h-[60px] z-1 border-b">
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
      </header>
      {children}
      <LastActivitySetter />
    </div>
  );
}
