import CalendarDayCell from "./CalendarDayCell";
import type { CalendarWeeks } from "../calendar.types";

type Props = {
	weeks: CalendarWeeks;
	todayDateString: string;
};

export default function CalendarGrid({ weeks, todayDateString }: Props) {
	return (
		<div className='grid p-2 sm:p-3 grid-rows-6 gap-1'>
			{weeks.map((week) => (
				<div
					key={week[0].dateString}
					className='grid grid-cols-7 gap-1'
				>
					{week.map((day) => (
						<CalendarDayCell
							key={day.dateString}
							day={day}
							isToday={day.dateString === todayDateString}
						/>
					))}
				</div>
			))}
		</div>
	);
}
