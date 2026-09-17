import type useLogicCalendar from "./calendar.hook";

export type CalendarState = ReturnType<typeof useLogicCalendar>;
export type CalendarWeeks = CalendarState["calendarWeeks"];
export type CalendarDay = CalendarWeeks[number][number];
