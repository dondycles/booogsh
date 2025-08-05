import { useGetTimeDifference } from "@/hooks/use-get-time-difference";
import { Dot } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";

export default function UserDotStatus({
  activityStatus,
  lastActivity,
  className,
}: {
  activityStatus: "visible" | "hidden" | null | undefined;
  lastActivity?: string | null | undefined;
  className?: string;
}) {
  const timeDifference = useGetTimeDifference(lastActivity);

  return activityStatus === "hidden" ? (
    <Dot className={cn("text-yellow-500 stroke-6", className)} />
  ) : lastActivity ? (
    timeDifference.timeDifferenceValue !== null &&
    timeDifference.timeDifferenceValue < 1 ? (
      <Dot className={cn("text-green-600 stroke-6", className)} />
    ) : (
      <Dot className={cn("text-muted-foreground stroke-6", className)} />
    )
  ) : (
    <Dot className={cn("text-muted stroke-6", className)} />
  );
}

export function DotTooltip({
  activityStatus,
  lastActivity,
  children,
}: {
  lastActivity?: string | null | undefined;
  children: React.ReactNode;
  activityStatus: "visible" | "hidden" | null | undefined;
}) {
  const timeDifference = useGetTimeDifference(lastActivity);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="ml-auto mr-0">{children}</TooltipTrigger>
        <TooltipContent>
          {activityStatus !== "hidden"
            ? timeDifference.timeDifferenceString
            : "Activity hidden"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
