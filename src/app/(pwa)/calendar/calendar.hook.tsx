"use client";

import { DATE_OF_WEEK, generateMonthCalendar } from "@/core/calc/generate";
import { useState } from "react";

const useLogicCalendar = () => {
	const today = new Date();
	const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
	const [currentTime, setCurrentTime] = useState<{ month: number; year: number }>({
		month: new Date().getMonth() + 1,
		year: new Date().getFullYear(),
	});

	const changeMonth = (action: "next" | "prev") => {
		if (action === "next") {
			if (currentTime.month === 12) {
				setCurrentTime({ month: 1, year: currentTime.year + 1 });
			} else {
				setCurrentTime({ month: currentTime.month + 1, year: currentTime.year });
			}
		}

		if (action === "prev") {
			if (currentTime.month === 1) {
				setCurrentTime({ month: 12, year: currentTime.year - 1 });
			} else {
				setCurrentTime({ month: currentTime.month - 1, year: currentTime.year });
			}
		}
	};

	const calendarWeeks = generateMonthCalendar(currentTime.year, currentTime.month);

	return { changeMonth, calendarWeeks, currentTime, dateOfWeek: DATE_OF_WEEK, todayDateString };
};

export default useLogicCalendar;
