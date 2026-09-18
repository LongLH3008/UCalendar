import { CalendarProvider } from "./_hooks/useCalendar";
import Calendar from "./_mobile/Calendar";

export default function Page() {
	return (
		<CalendarProvider>
			<Calendar />
		</CalendarProvider>
	);
}
