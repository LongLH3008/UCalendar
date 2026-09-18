import { Temporal } from "@js-temporal/polyfill";
import { solarToLunar, type LunarDate } from "../calc/lunar";
import type { CalendarEventDefinition } from "./calendar-event.types";
import { vietnamEvents } from "./vietnam-events";

export function eventsForDate(dateString: string, definitions: readonly CalendarEventDefinition[] = vietnamEvents) {
	const solar = Temporal.PlainDate.from(dateString);
	const lunar: LunarDate = solarToLunar(solar.year, solar.month, solar.day);
	return definitions.filter((event) => {
		if (event.validFrom && dateString < event.validFrom) return false;
		const rule = event.date;
		if (rule.calendar === "solar") return rule.solar.month === solar.month && rule.solar.day === solar.day;
		if (rule.calendar === "lunar") return rule.lunar.month === lunar.month && rule.lunar.day === lunar.day && rule.lunar.isLeapMonth === lunar.isLeapMonth;
		const next = solar.add({ days: -rule.offsetDays });
		const nextLunar = solarToLunar(next.year, next.month, next.day);
		return nextLunar.month === 1 && nextLunar.day === 1 && !nextLunar.isLeapMonth;
	});
}
