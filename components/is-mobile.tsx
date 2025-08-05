"use client";
import { useIsMobile } from "@/hooks/use-mobile";

export default function IsMobile({
  children,
  MOBILE_BREAKPOINT,
}: {
  children: React.ReactNode;
  MOBILE_BREAKPOINT: number;
}) {
  const isMobile = useIsMobile(MOBILE_BREAKPOINT);
  return isMobile ? null : children;
}
