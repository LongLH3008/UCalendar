"use client";

import { useCalendar } from "../_hooks/useCalendar";
import CalendarDayCell from "./CalendarDayCell";

export default function CalendarGrid() {
	const { calendarWeeks: weeks } = useCalendar();
	return (
		<div className='grid p-2 sm:p-3 grid-rows-6 gap-1'>
			{weeks.map((week) => (
				<div key={week[0].dateString} className='grid grid-cols-7 gap-1'>
					{week.map((day) => (
						<CalendarDayCell key={day.dateString} day={day} />
					))}
				</div>
			))}
		</div>
	);
}
