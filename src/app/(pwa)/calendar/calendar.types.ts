import type { useCalendar } from "./_hooks/useCalendar";

export type CalendarState = ReturnType<typeof useCalendar>;
export type CalendarWeeks = CalendarState["calendarWeeks"];
export type CalendarDay = CalendarWeeks[number][number];
