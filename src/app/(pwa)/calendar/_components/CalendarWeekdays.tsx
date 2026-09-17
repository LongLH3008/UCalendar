import { cn } from "@/core/lib/utils";
import { useTranslations } from "next-intl";
import type { CalendarState } from "../calendar.types";

type Props = {
	days: CalendarState["dateOfWeek"];
};

export default function CalendarWeekdays({ days }: Props) {
	const t = useTranslations("Calendar");
	return (
		<div className='grid grid-cols-7 p-2 text-[#18345B] text-[clamp(0.75rem,calc(0.725rem+0.125vw),0.8125rem)] font-semibold uppercase tracking-wider text-center'>
			{days.map((day, index) => (
				<span key={day} className={cn((index === 5 || index === 6) && "text-red-500")}>
					{t(`weekdays.${day}`)}
				</span>
			))}
		</div>
	);
}
