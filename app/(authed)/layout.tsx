import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="sticky top-0 left-0 w-full bg-muted ">
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto py-4 px-8">
          <p className="font-semibold text-sm">booog.sh</p>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Button asChild>
              <SignInButton />
            </Button>
          </SignedOut>
        </div>
      </header>
      {children}
    </div>
  );
}
