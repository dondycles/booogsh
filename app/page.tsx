import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="p-4 h-dvh w-full flex">
      <div className="space-y-4 text-center m-auto">
        <h1 className="text-6xl font-bold">booog.sh</h1>
        <p className="text-lg">
          Your platform to share and discover contents that go booogsh!
        </p>
        <SignedOut>
          <Button asChild>
            <SignInButton />
          </Button>
        </SignedOut>
        <SignedIn>
          <div className="flex gap-4 justify-center items-center">
            <Button asChild>
              <Link href="/feed">Go to feed</Link>
            </Button>
            <UserButton
              showName
              appearance={{
                elements: {
                  userButtonOuterIdentifier: {
                    color: "var(--muted-foreground)",
                    padding: 0,
                  },
                  userButtonTrigger: {
                    backgroundColor: "var(--muted)",
                    color: "var(--muted-foreground)",
                    padding: "4px 16px",
                    borderRadius: "var(--radius)",
                  },
                },
              }}
            />
          </div>
        </SignedIn>
      </div>
    </main>
  );
}

// function Content() {
//   const posts = useQuery(api.posts.getPublicPosts);
//   const addPost = useMutation(api.posts.add);
//   const { isAuthenticated, user } = useStoreUserEffect();
//   if (isAuthenticated)
//     return (
//       <div className="flex flex-col gap-4 max-w-lg mx-auto">
//         {user ? user.username : "NO USER"}
//         {posts?.length ? (
//           posts?.map((post) => {
//             return (
//               <div
//                 key={post._id}
//                 className="flex flex-col gap-2 bg-muted rounded-md p-4"
//               >
//                 <p>{post.user?.username}</p>
//                 <p>{post.message}</p>
//                 <p>
//                   Posted At: {new Date(post._creationTime).toLocaleDateString()}
//                 </p>
//                 <p hidden={!post.lastUpdate}>
//                   Last Update:{" "}
//                   {new Date(post.lastUpdate as string).toLocaleDateString()}
//                 </p>
//                 <p>{post.userId}</p>
//               </div>
//             );
//           })
//         ) : (
//           <p>No posts available</p>
//         )}
//         <p>
//           <button
//             className="bg-foreground text-background text-sm px-4 py-2 rounded-md"
//             onClick={() => {
//               void addPost({ message: "Hello, world!" });
//             }}
//           >
//             Add a post
//           </button>
//         </p>
//       </div>
//     );

//   return <SignInButton />;
// }
