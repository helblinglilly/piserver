import { useEffect, useState } from "react";

export const useTime = () => {
	const [today, setDate] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setDate(new Date());
		}, 10 * 1000);
		return () => {
			clearInterval(timer);
		};
	}, []);

	return today;
};

export default useTime;
