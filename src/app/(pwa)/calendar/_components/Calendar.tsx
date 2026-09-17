"use client";

import useLogicCalendar from "../calendar.hook";
import useCalendarSwipe from "../calendar-swipe.hook";
import type { SwipeDirection } from "../calendar-swipe.hook";
import { useState } from "react";
import styles from "../calendar.module.css";
import CalendarGrid from "./CalendarGrid";
import CalendarHeader from "./CalendarHeader";
import CalendarNavigation from "./CalendarNavigation";
import CalendarWeekdays from "./CalendarWeekdays";

export default function Calendar() {
	const { calendarWeeks, changeMonth, currentTime, dateOfWeek, todayDateString } = useLogicCalendar();
	const [motion, setMotion] = useState<SwipeDirection | null>(null);
	const navigate = (direction: "next" | "prev", swipe?: SwipeDirection) => {
		setMotion(swipe ?? (direction === "next" ? "right" : "left"));
		changeMonth(direction);
	};
	const swipeHandlers = useCalendarSwipe(navigate);

	return (
		<article className='bg-white h-screen font-sans flex flex-col gap-10 justify-center items-center max-w-xl w-full mx-auto'>
			<div className='w-full rounded-xl overflow-hidden shadow-xl'>
				<CalendarHeader currentTime={currentTime} />
				<div {...swipeHandlers} className='bg-[#FEF9F3] w-full h-full touch-none select-none overflow-hidden'>
					<CalendarWeekdays days={dateOfWeek} />
					<div
						key={`${currentTime.year}-${currentTime.month}`}
						className={motion ? styles.monthTransition : undefined}
						data-motion={motion ?? undefined}
					>
						<CalendarGrid weeks={calendarWeeks} todayDateString={todayDateString} />
					</div>
				</div>
			</div>
			<CalendarNavigation onChangeMonth={navigate} />
		</article>
	);
}
