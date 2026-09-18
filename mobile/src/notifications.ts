import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Preferences } from "@capacitor/preferences";
import { buildDailyReminders, REMINDER_ID_BASE } from "@/core/calendar-events/reminders";

const STORE_KEY = "ucalendar.event-reminders.v1";
const CHANNEL = "calendar-events";
const TEST_ID = 99_999_999;
type SavedSettings = { enabled: boolean; scheduledKeys: string[] };
export type ReminderStatus = { enabled: boolean; count: number; through?: string; exact: boolean; permission: string };
export const supportsNativeReminders = () => Capacitor.isNativePlatform();
const owns = (id: number) => id >= REMINDER_ID_BASE && id < 200_000_000;

async function load(): Promise<SavedSettings> {
	const { value } = await Preferences.get({ key: STORE_KEY });
	if (!value) return { enabled: false, scheduledKeys: [] };
	const parsed = JSON.parse(value) as SavedSettings;
	if (typeof parsed.enabled !== "boolean" || !Array.isArray(parsed.scheduledKeys)) throw new Error("Invalid reminder settings");
	return parsed;
}

async function save(settings: SavedSettings) { await Preferences.set({ key: STORE_KEY, value: JSON.stringify(settings) }); }

// Serialize resume, locale changes and user actions to avoid competing schedules.
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(operation: () => Promise<T>): Promise<T> {
	const result = queue.then(operation, operation);
	queue = result.catch(() => undefined);
	return result;
}

export function syncReminders(locale: "vi" | "en", enabled?: boolean): Promise<ReminderStatus> {
	return serial(async () => {
		if (!supportsNativeReminders()) return { enabled: false, count: 0, exact: false, permission: "unsupported" };
		const settings = await load();
		if (enabled !== undefined) { settings.enabled = enabled; await save(settings); }
		if (enabled === true) await LocalNotifications.requestPermissions();
		const { display: permission } = await LocalNotifications.checkPermissions();
		const pending = (await LocalNotifications.getPending()).notifications.filter((item) => owns(item.id));
		if (!settings.enabled || permission !== "granted") {
			if (pending.length) await LocalNotifications.cancel({ notifications: pending.map(({ id }) => ({ id })) });
			if (enabled === false) await LocalNotifications.cancel({ notifications: [{ id: TEST_ID }] });
			return { enabled: settings.enabled, count: 0, exact: false, permission };
		}
		let exact = true;
		if (Capacitor.getPlatform() === "android") {
			await LocalNotifications.createChannel({ id: CHANNEL, name: locale === "vi" ? "Sự kiện lịch" : "Calendar events", importance: 4, visibility: 1 });
			exact = (await LocalNotifications.checkExactNotificationSetting()).exact_alarm === "granted";
		}
		const reminders = buildDailyReminders(Date.now(), locale, settings.scheduledKeys);
		// A current-day catch-up already pending must survive locale/resume reconciliation.
		const currentPending = pending.filter((item) => !reminders.some((reminder) => reminder.id === item.id) &&
			settings.scheduledKeys.some((key) => key.startsWith(new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10)) && REMINDER_ID_BASE + Number(key.slice(0, 10).replaceAll("-", "")) === item.id));
		const stale = pending.filter((item) => !currentPending.some((keep) => keep.id === item.id));
		if (stale.length) await LocalNotifications.cancel({ notifications: stale.map(({ id }) => ({ id })) });
		if (reminders.length) {
			await LocalNotifications.schedule({ notifications: reminders.map((reminder) => ({
				id: reminder.id, title: reminder.title, body: reminder.body, channelId: CHANNEL,
			schedule: { at: new Date(reminder.at), allowWhileIdle: true }, isExactNotification: exact, foreground: true,
				extra: { owner: "ucalendar", dateString: reminder.dateString, eventIds: reminder.eventIds },
			})) });
		}
		const today = new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
		settings.scheduledKeys = [...new Set([...settings.scheduledKeys.filter((key) => key.slice(0, 10) >= today), ...reminders.map((item) => item.key)])];
		await save(settings);
		return { enabled: true, permission, exact, count: reminders.length + currentPending.length, through: reminders.at(-1)?.dateString };
	});
}

export async function requestExactAlarms() {
	if (Capacitor.getPlatform() === "android") await LocalNotifications.changeExactNotificationSetting();
}

export async function sendTestNotification(locale: "vi" | "en") {
	if (!supportsNativeReminders()) throw new Error("Native app required");
	if ((await LocalNotifications.requestPermissions()).display !== "granted") throw new Error("Notification permission denied");
	let exact = true;
	if (Capacitor.getPlatform() === "android") {
		await LocalNotifications.createChannel({ id: CHANNEL, name: "Calendar events", importance: 4, visibility: 1 });
		exact = (await LocalNotifications.checkExactNotificationSetting()).exact_alarm === "granted";
	}
	await LocalNotifications.schedule({ notifications: [{ id: TEST_ID, title: "UCalendar", body: locale === "vi" ? "Thông báo thử" : "Test notification", channelId: CHANNEL, schedule: { at: new Date(Date.now() + 10_000), allowWhileIdle: true }, isExactNotification: exact, foreground: true, extra: { owner: "ucalendar" } }] });
}
