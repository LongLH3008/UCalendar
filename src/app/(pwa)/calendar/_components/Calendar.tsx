"use client";

import useLogicCalendar from "../calendar.hook";
import CalendarGrid from "./CalendarGrid";
import CalendarHeader from "./CalendarHeader";
import CalendarNavigation from "./CalendarNavigation";
import CalendarWeekdays from "./CalendarWeekdays";

export default function Calendar() {
	const { calendarWeeks, changeMonth, currentTime, dateOfWeek, todayDateString } = useLogicCalendar();

	return (
		<article className='bg-white h-screen font-sans flex flex-col gap-10 justify-center items-center max-w-xl w-full mx-auto'>
			<div className='w-full rounded-xl overflow-hidden shadow-xl'>
				<CalendarHeader currentTime={currentTime} />
				<div className='bg-[#FEF9F3] w-full h-full'>
					<CalendarWeekdays days={dateOfWeek} />
					<CalendarGrid weeks={calendarWeeks} todayDateString={todayDateString} />
				</div>
			</div>
			<CalendarNavigation onChangeMonth={changeMonth} />
		</article>
	);
}
