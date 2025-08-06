import UserDeepViewClient from "./_userDeepViewClient";
export default async function UserDeepView({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { username } = await params;
	return <UserDeepViewClient username={username} />;
}
