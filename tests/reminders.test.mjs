import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
function loadTypeScript(filename, mocks = {}, cache = new Map()) {
	if (cache.has(filename)) return cache.get(filename);
	const loadedModule = { exports: {} };
	cache.set(filename, loadedModule.exports);
	const compiled = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
	new Function("require", "module", "exports", compiled)((id) => {
		if (id in mocks) return mocks[id];
		if (id.startsWith(".")) return loadTypeScript(path.resolve(path.dirname(filename), `${id}.ts`), mocks, cache);
		if (id.startsWith("@/")) return loadTypeScript(path.resolve("src", `${id.slice(2)}.ts`), mocks, cache);
		return require(id);
	}, loadedModule, loadedModule.exports);
	cache.set(filename, loadedModule.exports);
	return loadedModule.exports;
}
const { eventsForDate } = loadTypeScript(path.resolve("src/core/calendar-events/resolve-events.ts"));
const { buildDailyReminders } = loadTypeScript(path.resolve("src/core/calendar-events/reminders.ts"));

test("lunar festivals, 29-day year-end, leap months and effective date", () => {
	assert.ok(eventsForDate("2026-02-17").some((event) => event.id === "tet"));
	assert.ok(eventsForDate("2026-02-16").some((event) => event.id === "lunar-new-years-eve"));
	assert.ok(!eventsForDate("2025-11-24").some((event) => event.id === "vietnam-culture-day"));
	assert.ok(eventsForDate("2026-11-24").some((event) => event.id === "vietnam-culture-day"));
	assert.equal(eventsForDate("2004-03-21", [{ id: "test", date: { calendar: "lunar", lunar: { month: 2, day: 1, isLeapMonth: false } } }]).length, 0);
});

test("09:00 Vietnam time, bounded unique queue and same-day catch-up", () => {
	const now = Date.parse("2026-01-01T08:59:00+07:00");
	const reminders = buildDailyReminders(now, "vi");
	assert.equal(reminders[0].at, Date.parse("2026-01-01T09:00:00+07:00"));
	assert.ok(reminders.length <= 60);
	assert.equal(new Set(reminders.map((item) => item.id)).size, reminders.length);
	assert.ok(reminders.every((item) => new Date(item.at).getUTCHours() === 2));
	const late = Date.parse("2026-01-01T10:00:00+07:00");
	assert.equal(buildDailyReminders(late, "en")[0].at, late + 5000);
	assert.notEqual(buildDailyReminders(late, "en", [reminders[0].key])[0].dateString, "2026-01-01");
	assert.ok(buildDailyReminders(Date.parse("2026-01-02T10:00:00+07:00"), "en").every((item) => item.dateString >= "2026-01-02"));
});

test("native adapter schedules offline, preserves catch-up, restores missing alarms and cancels only its own IDs", async () => {
	let saved = null;
	let pending = [{ id: 42 }];
	const scheduled = [];
	const mocks = {
		"@capacitor/core": { Capacitor: { isNativePlatform: () => true, getPlatform: () => "android" } },
		"@capacitor/preferences": { Preferences: { get: async () => ({ value: saved }), set: async ({ value }) => { saved = value; } } },
		"@capacitor/local-notifications": { LocalNotifications: {
			requestPermissions: async () => ({ display: "granted" }), checkPermissions: async () => ({ display: "granted" }),
			getPending: async () => ({ notifications: pending }), createChannel: async () => {},
			checkExactNotificationSetting: async () => ({ exact_alarm: "granted" }),
			cancel: async ({ notifications }) => { pending = pending.filter((item) => !notifications.some(({ id }) => id === item.id)); },
			schedule: async ({ notifications }) => { scheduled.push(...notifications); pending.push(...notifications); return { notifications }; },
		} },
	};
	const { syncReminders, sendTestNotification } = loadTypeScript(path.resolve("mobile/src/notifications.ts"), mocks);
	const realNow = Date.now;
	Date.now = () => Date.parse("2026-01-01T10:00:00+07:00");
	try {
		await syncReminders("vi", true);
		assert.ok(scheduled.every((item) => item.isExactNotification && item.schedule.allowWhileIdle));
		const todayId = scheduled[0].id;
		await syncReminders("en");
		assert.equal(pending.filter(({ id }) => id === todayId).length, 1);
		pending = [{ id: 42 }]; // alarm permission revoked/reboot: restore future queue
		const restored = await syncReminders("vi");
		assert.ok(restored.count > 0);
		assert.ok(!pending.some(({ id }) => id === todayId)); // don't repeat today's delivered reminder
		await syncReminders("vi", false);
		assert.deepEqual(pending, [{ id: 42 }]);
		await sendTestNotification("vi");
		await syncReminders("vi");
		assert.ok(pending.some(({ id }) => id === 99_999_999));
		await syncReminders("vi", false);
		assert.deepEqual(pending, [{ id: 42 }]);
	} finally { Date.now = realNow; }
});
