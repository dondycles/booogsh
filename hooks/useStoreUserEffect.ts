import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

export function useStoreUserEffect() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isLoadingUserDb, setIsLoadingUserDb] = useState(true);
  const [userDb, setUserDb] = useState<null | Doc<"users">>(null);
  const checkAndGetCurrentUser = useMutation(api.users.checkAndGetCurrentUser);

  useEffect(() => {
    if (!isSignedIn) {
      return () => {
        setUserDb(null);
        setIsLoadingUserDb(false);
      };
    }

    async function createUser() {
      try {
        setUserDb(
          await checkAndGetCurrentUser({
            info: {
              email: user?.primaryEmailAddress?.emailAddress ?? "",
              name: user?.fullName ?? "Anonymous",
              username: user?.username ?? "",
              pfp: user?.imageUrl ?? "",
            },
          }),
        );
        setIsLoadingUserDb(false);
      } catch (error) {
        if (error instanceof ConvexError) {
          toast.error(error.message);
        } else {
          toast.error("User could not be created. Please try again.");
        }
      }
    }
    createUser();

    return () => {
      setUserDb(null);
      setIsLoadingUserDb(true);
    };
  }, [
    isSignedIn,
    checkAndGetCurrentUser,
    user?.id,
    user?.primaryEmailAddress,
    user?.fullName,
    user?.username,
    user?.imageUrl,
  ]);

  return {
    isLoading: !isLoaded || (isSignedIn && user.id === null) || isLoadingUserDb,
    isAuthenticated: isSignedIn && user.id !== null,
    user: userDb,
  };
}
