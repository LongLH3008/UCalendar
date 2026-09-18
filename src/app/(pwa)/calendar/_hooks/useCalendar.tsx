"use client";

import { DATE_OF_WEEK, generateMonthCalendar } from "@/core/calc/generate";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { SwipeDirection } from "./useCalendarSwipe";

const useLogicCalendar = () => {
	const today = new Date();
	const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
	const [currentTime, setCurrentTime] = useState({
		month: today.getMonth() + 1,
		year: today.getFullYear(),
	});
	const [motion, setMotion] = useState<SwipeDirection | null>(null);
	const [selectedDateString, setSelectedDateString] = useState<string | null>(null);
	const openDate = useCallback((dateString: string) => {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return;
		const date = new Date(`${dateString}T00:00:00+07:00`);
		if (!Number.isFinite(date.getTime())) return;
		const [year, month] = dateString.split("-").map(Number);
		setCurrentTime({ year, month });
		setSelectedDateString(dateString);
		setMotion(null);
	}, []);

	const changeMonth = (action: "next" | "prev", swipe?: SwipeDirection) => {
		setMotion(swipe ?? (action === "next" ? "left" : "right"));
		setCurrentTime((previous) => {
			const month = previous.month + (action === "next" ? 1 : -1);
			if (month === 13) return { month: 1, year: previous.year + 1 };
			if (month === 0) return { month: 12, year: previous.year - 1 };
			return { month, year: previous.year };
		});
	};

	const calendarWeeks = generateMonthCalendar(currentTime.year, currentTime.month);
	return { changeMonth, calendarWeeks, currentTime, dateOfWeek: DATE_OF_WEEK, todayDateString, motion, openDate, selectedDateString };
};

const CalendarContext = createContext<ReturnType<typeof useLogicCalendar> | null>(null);

export function CalendarProvider({ children }: { children: ReactNode }) {
	const value = useLogicCalendar();
	return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar() {
	const context = useContext(CalendarContext);
	if (!context) throw new Error("useCalendar must be used within CalendarProvider");
	return context;
}

export default useCalendar;
