// Date keys follow CalendarDay.solar/lunar. Recurring rules intentionally omit year.
// Keep core types independent of app hooks: CalendarDay is inferred from the generator.
export type MonthDay = { month: number; day: number };

export type CalendarEventImage = {
	src: string;
	alt: { vi: string; en: string };
	width: number;
	height: number;
	author: string;
	license: string;
	licenseUrl: string;
	sourceUrl: string;
};

export type CalendarEventDate =
	| { calendar: "solar"; solar: MonthDay }
	| { calendar: "lunar"; lunar: MonthDay & { isLeapMonth: false } }
	| { calendar: "lunar-new-year-offset"; offsetDays: -1 };

export type CalendarEventDefinition = {
	id: string;
	name: { vi: string; en: string };
	category: "public-holiday" | "commemoration" | "traditional" | "international";
	date: CalendarEventDate;
	image: CalendarEventImage;
	// ISO solar date; resolver must check this against CalendarDay.dateString.
	validFrom?: string;
	sourceIds: readonly string[];
	notes?: string;
};

// Actual dates of leave are separate from the annually recurring festival anchors.
export type AnnualHolidayDate = {
	dateString: string;
	eventId: string;
	kind: "holiday" | "substitute-day-off" | "swapped-day-off" | "make-up-workday";
	appliesTo: "public-sector" | "employer-schedule";
	sourceUrl: string;
};
