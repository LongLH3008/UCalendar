"use client";

import { useCalendar } from "../_hooks/useCalendar";
import useCalendarSwipe from "../_hooks/useCalendarSwipe";
import styles from "../calendar.module.css";
import CalendarGrid from "./CalendarGrid";
import CalendarHeader from "./CalendarHeader";
import CalendarWeekdays from "./CalendarWeekdays";

export default function Calendar() {
	const { changeMonth, currentTime, motion } = useCalendar();
	const swipeHandlers = useCalendarSwipe(changeMonth);

	return (
		<article className='bg-[#FEF9F3] h-screen font-sans flex flex-col gap-10 justify-center items-center'>
			<div className='max-w-[calc(100%-16px)] sm:max-w-96 w-full mx-auto'>
				<CalendarHeader />
				<div
					{...swipeHandlers}
					className='bg-[#FEF9F3] mt-4 w-full h-full touch-none select-none overflow-hidden'
				>
					<CalendarWeekdays />
					<div
						key={`${currentTime.year}-${currentTime.month}`}
						className={motion ? styles.monthTransition : undefined}
						data-motion={motion ?? undefined}
					>
						<CalendarGrid />
					</div>
				</div>
			</div>
		</article>
	);
}
