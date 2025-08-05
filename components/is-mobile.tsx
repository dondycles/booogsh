"use client";
import { useIsMobile } from "@/hooks/use-mobile";

export default function IsMobile({
  children,
  MOBILE_BREAKPOINT,
  reverse = false,
}: {
  children: React.ReactNode;
  MOBILE_BREAKPOINT: number;
  reverse?: boolean;
}) {
  const isMobile = useIsMobile(MOBILE_BREAKPOINT);
  return !reverse ? (isMobile ? null : children) : isMobile ? children : null;
}
