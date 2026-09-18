import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { App } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useCalendar } from "@/app/(pwa)/calendar/_hooks/useCalendar";
import { syncReminders, sendTestNotification, supportsNativeReminders, requestExactAlarms, type ReminderStatus } from "./notifications";

export default function MobileReminders() {
	const locale = useLocale() === "vi" ? "vi" : "en";
	const { openDate } = useCalendar();
	const [status, setStatus] = useState<ReminderStatus | null>(null);
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);
	useEffect(() => {
		let disposed = false;
		const sync = () => syncReminders(locale).then((value) => { if (!disposed) setStatus(value); }).catch((cause: unknown) => { if (!disposed) setError(String(cause)); });
		void sync();
		const resume = App.addListener("appStateChange", ({ isActive }) => { if (isActive) void sync(); });
		const action = LocalNotifications.addListener("localNotificationActionPerformed", ({ notification }) => {
			const dateString: unknown = notification.extra?.dateString;
			if (typeof dateString === "string") openDate(dateString);
		});
		return () => { disposed = true; void resume.then((listener) => listener.remove()); void action.then((listener) => listener.remove()); };
	}, [locale, openDate]);
	const run = async (operation: () => Promise<unknown>) => {
		setBusy(true); setError("");
		try { await operation(); setStatus(await syncReminders(locale)); } catch (cause) { setError(String(cause)); }
		finally { setBusy(false); }
	};
	const vi = locale === "vi";
	if (!supportsNativeReminders()) return <p className="p-4 text-center text-sm">{vi ? "Nhắc offline khi đóng app khả dụng trong bản Android/iOS." : "Offline reminders while closed are available in the Android/iOS app."}</p>;
	return <section className="mx-auto max-w-96 rounded-xl border border-slate-200 bg-white p-4 text-sm text-[#153157]" aria-label={vi ? "Nhắc sự kiện" : "Event reminders"}>
		<label className="flex items-center justify-between gap-4 font-semibold">
			{vi ? "Nhắc sự kiện lúc 9:00 (giờ Việt Nam)" : "Event reminders at 09:00 (Vietnam time)"}
			<input type="checkbox" checked={status?.enabled ?? false} disabled={busy || !status} onChange={(event) => void run(() => syncReminders(locale, event.target.checked))} />
		</label>
		{status?.enabled && <p className="mt-2">{status.permission !== "granted" ? (vi ? "Hãy cho phép thông báo trong cài đặt điện thoại." : "Allow notifications in your phone settings.") : (vi ? `${status.count} ngày đã đặt lịch${status.through ? `, đến ${status.through}` : ""}. Mở app để bổ sung lịch tiếp theo.` : `${status.count} days scheduled${status.through ? `, through ${status.through}` : ""}. Open the app to extend reminders.`)}</p>}
		{status?.enabled && status.permission === "granted" && !status.exact && <div className="mt-2"><p>{vi ? "Chưa có quyền hẹn giờ chính xác; thông báo có thể trễ." : "Exact alarms are not enabled; notifications may be delayed."}</p><button className="mt-2 underline" disabled={busy} onClick={() => void run(requestExactAlarms)}>{vi ? "Cho phép hẹn giờ chính xác" : "Enable exact alarms"}</button></div>}
		<button className="mt-3 underline" disabled={busy} onClick={() => void run(() => sendTestNotification(locale))}>{vi ? "Thông báo thử sau 10 giây" : "Test notification in 10 seconds"}</button>
		{error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
	</section>;
}
