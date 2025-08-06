import {
	differenceInDays,
	differenceInHours,
	differenceInMinutes,
	differenceInMonths,
	differenceInSeconds,
} from "date-fns";
import { useEffect, useState } from "react";

export const useGetTimeDifference = (
	date: Date | string | null | undefined,
) => {
	const [timeDifferenceString, setTimeDifferenceString] = useState<
		string | null
	>(null);
	const [timeDifferenceValue, setTimeDifferenceValue] = useState<number | null>(
		null,
	);

	useEffect(() => {
		const updateTimeDifference = () => {
			const now = new Date();

			if (!date) {
				setTimeDifferenceString(null);
				setTimeDifferenceValue(null);
				return;
			}

			const targetDate = new Date(date);
			const diffInSeconds = differenceInSeconds(now, targetDate);
			const diffInMinutes = differenceInMinutes(now, targetDate);
			const diffInHours = differenceInHours(now, targetDate);
			const diffInDays = differenceInDays(now, targetDate);
			const diffInMonths = differenceInMonths(now, targetDate);

			const finalDiff =
				diffInSeconds < 60
					? `${diffInSeconds} seconds ago`
					: diffInMinutes < 60
						? `${diffInMinutes} minutes ago`
						: diffInHours < 24
							? `${diffInHours} hours ago`
							: diffInDays < 30
								? `${diffInDays} days ago`
								: `${diffInMonths} months ago`;

			setTimeDifferenceString(finalDiff);
			setTimeDifferenceValue(diffInSeconds);
		};

		updateTimeDifference();
		const interval = setInterval(updateTimeDifference, 1000);

		return () => clearInterval(interval);
	}, [date]);

	return { timeDifferenceString, timeDifferenceValue };
};
