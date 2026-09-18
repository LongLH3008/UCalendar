"use client";

import { cn } from "@/core/lib/utils";
import { useCalendar } from "../_hooks/useCalendar";
import type { CalendarDay } from "../calendar.types";

type Props = {
	day: CalendarDay;
};

const isSpecialLunarDay = (day: number) => day === 1 || day === 15;

export default function CalendarDayCell({ day }: Props) {
	const { todayDateString } = useCalendar();
	const isToday = day.dateString === todayDateString;
	const isWeekend = day.dateOfWeek === "Sat" || day.dateOfWeek === "Sun";

	return (
		<div
			aria-current={isToday ? "date" : undefined}
			className={cn(
				"flex aspect-square flex-col items-center justify-center rounded-lg border p-1",
				isToday
					? "border-[#153157] bg-[#153157] text-white"
					: day.isCurrentMonth
						? "border-dashed border-[#CBD5E1] bg-zinc-100 text-[#64748B]"
						: "border-[#EFEFEF] bg-[#FEF9F3] text-[#2A2A2A] opacity-70",
			)}
		>
			<span
				className={cn(
					"text-[clamp(1rem,calc(0.975rem+0.125vw),1.0625rem)] tabular-nums",
					isToday ? "font-bold" : day.isCurrentMonth ? "font-medium" : "font-normal",
					!isToday && isWeekend && "text-red-500",
				)}
			>
				{day.solar.day}
			</span>
			<span
				className={`text-xs font-normal tabular-nums ${isSpecialLunarDay(day.lunar.day) ? "text-red-500" : ""}`}
			>
				{day.lunar.day}
				{isSpecialLunarDay(day.lunar.day) ? `/${day.lunar.month}` : ""}
				{day.lunar.isLeapMonth}
			</span>
		</div>
	);
}
