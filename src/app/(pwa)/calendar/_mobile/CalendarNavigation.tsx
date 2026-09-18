"use client";

import { useTranslations } from "next-intl";
import { useCalendar } from "../_hooks/useCalendar";

export default function CalendarNavigation() {
	const { changeMonth } = useCalendar();
	const t = useTranslations("Calendar");
	return (
		<div className='w-full flex justify-between'>
			<button aria-label={t("previousLabel")} onClick={() => changeMonth("prev")}>
				{t("previous")}
			</button>
			<button aria-label={t("nextLabel")} onClick={() => changeMonth("next")}>
				{t("next")}
			</button>
		</div>
	);
}
