import UserDeepViewClient from "./userDeepViewClient";
export default async function UserDeepView({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <UserDeepViewClient username={username} />;
}
