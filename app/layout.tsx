import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import ConvexClientProvider from "@/components/providers/convex-client-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
	variable: "--font-poppins",
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
	title: "booog.sh | Share and discover contents that go booogsh!",
	description: "Share and discover contents that go booogsh!",
	icons: {
		icon: "/convex.svg",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${poppins.variable} font-poppins antialiased `}>
				<ClerkProvider
					dynamic
					afterSignOutUrl={"/"}
					signInForceRedirectUrl={"/feed"}
					signUpForceRedirectUrl={"/feed"}
					appearance={{
						theme: shadcn,
					}}
				>
					<ConvexClientProvider>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							{children}
							<Toaster richColors />
						</ThemeProvider>
					</ConvexClientProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}
