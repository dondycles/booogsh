import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

export function useStoreUserEffect() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isLoadingUserDb, setIsLoadingUserDb] = useState(true);
  const [userDb, setUserDb] = useState<null | Doc<"users">>(null);
  const storeUser = useMutation(api.users.checkAndGetUser);

  useEffect(() => {
    if (!isSignedIn) {
      return () => {
        setUserDb(null);
        setIsLoadingUserDb(false);
      };
    }

    async function createUser() {
      const userData = await storeUser({
        info: {
          email: user?.primaryEmailAddress?.emailAddress ?? "",
          name: user?.fullName ?? "Anonymous",
          username: user?.username ?? "",
          pfp: user?.imageUrl ?? "",
        },
      });
      setUserDb(userData);
      setIsLoadingUserDb(false);
    }
    createUser();

    return () => {
      setUserDb(null);
      setIsLoadingUserDb(true);
    };
  }, [
    isSignedIn,
    storeUser,
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
