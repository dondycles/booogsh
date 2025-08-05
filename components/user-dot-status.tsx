import { useGetTimeDifference } from "@/hooks/use-get-time-difference";
import { Dot as DotIcon } from "lucide-react";
import {
  Tooltip as TooltipComponent,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { useContext, createContext } from "react";
export interface UserDotStatusProps {
  activityStatus: "visible" | "hidden" | null | undefined;
  lastActivity?: string | null | undefined;
}

const Context = createContext<UserDotStatusProps | null>(null);

export function useUserDotStatusContext() {
  const context = useContext(Context);
  if (!context) {
    throw new Error(
      "useUserDotStatusContext must be used within a UserDotStatusProvider",
    );
  }
  return context;
}

function Dot({ className }: { className?: string }) {
  const { lastActivity, activityStatus } = useUserDotStatusContext();
  const timeDifference = useGetTimeDifference(lastActivity);

  return activityStatus === "hidden" ? (
    <DotIcon className={cn("text-muted-foreground/30 stroke-6 ", className)} />
  ) : lastActivity ? (
    timeDifference.timeDifferenceValue !== null &&
    timeDifference.timeDifferenceValue < 1 ? (
      <DotIcon className={cn("text-green-600 stroke-6", className)} />
    ) : (
      <DotIcon className={cn("text-muted-foreground stroke-6", className)} />
    )
  ) : (
    <DotIcon className={cn("text-muted-foreground/30 stroke-6", className)} />
  );
}

function Tooltip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { lastActivity, activityStatus } = useUserDotStatusContext();
  const timeDifference = useGetTimeDifference(lastActivity);
  return (
    <TooltipProvider>
      <TooltipComponent>
        <TooltipTrigger className={className}>{children}</TooltipTrigger>
        <TooltipContent hidden={timeDifference.timeDifferenceValue === 0}>
          {activityStatus !== "hidden"
            ? timeDifference.timeDifferenceString
            : "Activity hidden"}
        </TooltipContent>
      </TooltipComponent>
    </TooltipProvider>
  );
}

export { Dot, Tooltip, Context };
