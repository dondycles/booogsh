"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function LastActivitySetter() {
  const setLastActivity = useMutation(api.users.updateLastActivity);
  const pathname = usePathname();

  useEffect(() => {
    setLastActivity();

    const interval = setInterval(() => {
      if (window.document.hidden) return;
      setLastActivity();
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [setLastActivity, pathname]);

  return null;
}
