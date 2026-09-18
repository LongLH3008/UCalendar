import { Temporal } from "@js-temporal/polyfill";
import { eventsForDate } from "./resolve-events";

export const REMINDER_TIME_ZONE = "Asia/Ho_Chi_Minh";
export const REMINDER_ID_BASE = 100_000_000;
export type DailyReminder = { id: number; key: string; dateString: string; at: number; eventIds: string[]; title: string; body: string };

export function buildDailyReminders(now: number, locale: "vi" | "en", alreadyScheduled: readonly string[] = [], limit = 60): DailyReminder[] {
	const today = Temporal.Instant.fromEpochMilliseconds(now).toZonedDateTimeISO(REMINDER_TIME_ZONE).toPlainDate();
	const reminders: DailyReminder[] = [];
	// A bounded queue of one notification per day avoids multiple Doze alarms at 09:00.
	for (let offset = 0; offset < 730 && reminders.length < limit; offset++) {
		const date = today.add({ days: offset });
		const dateString = date.toString();
		const events = eventsForDate(dateString);
		if (!events.length) continue;
		let at = date.toZonedDateTime({ timeZone: REMINDER_TIME_ZONE, plainTime: "09:00" }).epochMilliseconds;
		const key = `${dateString}@09:00@${REMINDER_TIME_ZONE}`;
		if (at <= now) {
			if (alreadyScheduled.includes(key)) continue;
			// Enable/open after 09:00: a single same-day catch-up, never yesterday's events.
			at = now + 5_000;
		}
		reminders.push({ id: REMINDER_ID_BASE + Number(dateString.replaceAll("-", "")), key, dateString, at,
			eventIds: events.map((event) => event.id),
			title: locale === "vi" ? "Sự kiện hôm nay" : "Today's events",
			body: events.map((event) => event.name[locale]).join(" · "),
		});
	}
	return reminders;
}
