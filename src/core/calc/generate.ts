import { Temporal } from "@js-temporal/polyfill";
import { logger } from "../lib/logger";
import { solarToLunar } from "./lunar";

export const DATE_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function generateMonthCalendar(year: number, month: number) {
	// 1. Xác định ngày đầu tiên và ngày cuối cùng của tháng đó
	const firstDayOfMonth = Temporal.PlainDate.from({ year, month, day: 1 });
	const daysInMonth = firstDayOfMonth.daysInMonth; // Tự động biết tháng có 28, 30 hay 31 ngày

	// 2. Tìm ngày đầu tuần (Thứ 2) của tuần đầu tiên trong tháng
	// dayOfWeek trả về từ 1 (Thứ 2) đến 7 (Chủ Nhật) theo chuẩn ISO
	const startOffset = firstDayOfMonth.dayOfWeek - 1;
	const weeksInMonth = Math.ceil((startOffset + daysInMonth) / 7);
	let currentGridDate = firstDayOfMonth.subtract({ days: startOffset });

	const calendarWeeks = [];

	// 3. Chỉ tạo đủ các tuần chứa ngày trong tháng, mỗi tuần gồm 7 ô
	for (let week = 0; week < weeksInMonth; week++) {
		const weekDays = [];
		for (let day = 0; day < 7; day++) {
			weekDays.push({
				dateOfWeek: DATE_OF_WEEK[day],
				dateString: currentGridDate.toString(), // YYYY-MM-DD
				solar: {
					year: currentGridDate.year,
					month: currentGridDate.month,
					day: currentGridDate.day,
				},
				lunar: solarToLunar(currentGridDate.year, currentGridDate.month, currentGridDate.day),
				month: currentGridDate.month,
				isCurrentMonth: currentGridDate.month === month,
			});

			// Tịnh tiến thêm 1 ngày bằng phương thức cộng của Temporal
			currentGridDate = currentGridDate.add({ days: 1 });
		}
		calendarWeeks.push(weekDays);
	}

	logger.info(`[time]: ${month} / ${year}\n`, calendarWeeks);

	return calendarWeeks;
}
