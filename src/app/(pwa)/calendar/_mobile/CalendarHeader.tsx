"use client";

import Heading from "@/components/shared/Heading";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useCalendar } from "../_hooks/useCalendar";

export default function CalendarHeader() {
	const { currentTime, changeMonth } = useCalendar();
	const format = useFormatter();
	const t = useTranslations("Calendar");
	const month = new Date(Date.UTC(currentTime.year, currentTime.month - 1, 1));
	const daysInMonth = new Date(Date.UTC(currentTime.year, currentTime.month, 0)).getUTCDate();
	const buttonClassName =
		"flex size-10 shrink-0 cursor-pointer items-center rounded-lg justify-center bg-white/10 text-white/80 transition-all hover:bg-white/20 active:bg-white/25 active:scale-80 duration-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

	return (
		<div className='flex w-full items-center justify-between gap-2 rounded-2xl bg-[#153157] p-5'>
			<div className='w-full'>
				<Heading as='h5' className='text-white font-bold leading-tight capitalize'>
					{format.dateTime(month, { month: "long", year: "numeric", timeZone: "UTC" })}
				</Heading>
				<div className='flex items-center gap-1'>
					<CalendarDays className='text-white/50' size={16} />
					<p className='text-sm font-medium text-white/50'>
						{t("daysInMonth", { count: daysInMonth })}
					</p>
				</div>
			</div>
			<button
				type='button'
				aria-label={t("previousLabel")}
				onClick={() => changeMonth("prev")}
				className={buttonClassName}
			>
				<ChevronLeft size={20} aria-hidden='true' />
			</button>
			<button
				type='button'
				aria-label={t("nextLabel")}
				onClick={() => changeMonth("next")}
				className={buttonClassName}
			>
				<ChevronRight size={20} aria-hidden='true' />
			</button>
		</div>
	);
}
