"use client";

import { cn } from "@/core/lib/utils";
import { useTranslations } from "next-intl";
import { useCalendar } from "../_hooks/useCalendar";

export default function CalendarWeekdays() {
	const { dateOfWeek: days } = useCalendar();
	const t = useTranslations("Calendar");
	return (
		<div className='grid grid-cols-7 p-2 pb-0 text-[#18345B] text-[clamp(0.75rem,calc(0.725rem+0.125vw),0.8125rem)] font-semibold tracking-wider text-center'>
			{days.map((day, index) => (
				<span key={day} className={cn((index === 5 || index === 6) && "text-red-500")}>
					{t(`weekdays.${day}`)}
				</span>
			))}
		</div>
	);
}
