"use client";

import { useMutation } from "convex/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

export default function LastActivitySetter() {
	const setLastActivity = useMutation(api.users.updateLastActivity);
	const pathname = usePathname();

	useEffect(() => {
		if (pathname === "/") return;
		setLastActivity();

		const interval = setInterval(() => {
			if (window.document.hidden) return;
			setLastActivity();
		}, 1000); // Update every second

		return () => clearInterval(interval);
	}, [setLastActivity, pathname]);

	return null;
}
