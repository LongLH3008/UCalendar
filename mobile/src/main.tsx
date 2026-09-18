import { createRoot } from "react-dom/client";
import LocaleProvider from "@/i18n/LocaleProvider";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { CalendarProvider } from "@/app/(pwa)/calendar/_hooks/useCalendar";
import Calendar from "@/app/(pwa)/calendar/_mobile/Calendar";
import MobileReminders from "./MobileReminders";
import "./mobile.css";

createRoot(document.getElementById("root")!).render(
	<LocaleProvider initialLocale="en">
		<CalendarProvider>
			<div className="mobile-shell">
				<header className="flex justify-end px-4 py-3"><LanguageSwitcher /></header>
				<Calendar />
				<MobileReminders />
			</div>
		</CalendarProvider>
	</LocaleProvider>,
);
