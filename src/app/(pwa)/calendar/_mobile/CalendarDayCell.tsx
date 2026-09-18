"use client";

import { cn } from "@/core/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { eventDetails } from "@/core/calendar-events/event-details";
import { Moon, Paperclip } from "lucide-react";
import { useLocale } from "next-intl";
import { useCalendar } from "../_hooks/useCalendar";
import type { CalendarDay } from "../calendar.types";

type Props = {
	day: CalendarDay;
};

const isSpecialLunarDay = (day: number) => day === 1 || day === 15;

export default function CalendarDayCell({ day }: Props) {
	const { todayDateString, selectedDateString } = useCalendar();
	const locale = useLocale() === "vi" ? "vi" : "en";
	const isToday = day.dateString === todayDateString;
	const isWeekend = day.dateOfWeek === "Sat" || day.dateOfWeek === "Sun";
	const hasSolarEvent = day.events.some((event) => event.date.calendar === "solar");
	const hasLunarEvent = day.events.some((event) => event.date.calendar !== "solar");
	const hasEvents = day.events.length > 0;
	const Cell = hasEvents ? "button" : "div";
	const vi = locale === "vi";
	const dateLabel = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${day.dateString}T00:00:00Z`));
	const categoryLabels = {
		"public-holiday": vi ? "Ngày lễ" : "Public holiday",
		commemoration: vi ? "Ngày kỷ niệm" : "Commemoration",
		traditional: vi ? "Lễ truyền thống" : "Traditional festival",
		international: vi ? "Sự kiện quốc tế" : "International observance",
	};

	const cell = (
		<Cell
			type={hasEvents ? "button" : undefined}
			aria-label={hasEvents ? `${dateLabel}: ${day.events.map((event) => event.name[locale]).join(" · ")}` : undefined}
			title={day.events.map((event) => event.name[locale]).join(" · ") || undefined}
			aria-current={isToday ? "date" : undefined}
			className={cn(
				"flex relative aspect-square flex-col items-center justify-center rounded-lg border p-1",
				day.events.length > 0 && "ring-1 ring-[#153157]/50",
				hasEvents && "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#153157]",
				day.dateString === selectedDateString && "outline-2 outline-offset-2 outline-[#153157]",
				isToday
					? "border-[#153157] bg-[#153157] text-white"
					: day.isCurrentMonth
						? "border-dashed border-[#CBD5E1] bg-zinc-100 text-[#64748B]"
						: "border-[#EFEFEF] bg-[#FEF9F3] text-[#2A2A2A] opacity-70",
			)}
		>
			{day.events.length > 0 && (
				<div className='absolute right-[-4px] top-[-4px] flex'>
					{hasSolarEvent && <Paperclip size={14} aria-hidden='true' className='text-[#153157]/50 bg-[#FEF9F3]' />}
					{hasLunarEvent && <Moon size={14} aria-hidden='true' className='text-[#153157]/50 bg-[#FEF9F3]' />}
				</div>
			)}
			<span
				className={cn(
					"text-[clamp(1rem,calc(0.975rem+0.125vw),1.0625rem)] tabular-nums",
					isToday ? "font-bold" : day.isCurrentMonth ? "font-medium" : "font-normal",
					!isToday && isWeekend && "text-red-500",
				)}
			>
				{day.solar.day}
			</span>
			<span
				className={`text-xs font-normal tabular-nums ${isSpecialLunarDay(day.lunar.day) ? "text-red-500" : ""}`}
			>
				{day.lunar.day}
				{isSpecialLunarDay(day.lunar.day) ? `/${day.lunar.month}` : ""}
				{day.lunar.isLeapMonth}
			</span>
		</Cell>
	);
	if (!hasEvents) return cell;
	return <Dialog>
		<DialogTrigger asChild>{cell}</DialogTrigger>
		<DialogContent className='max-h-[85dvh] w-[calc(100%-1rem)] max-w-96 gap-0 overflow-y-auto overscroll-contain rounded-2xl border-gray-200 bg-white p-5 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.16)] sm:rounded-2xl'>
			<DialogHeader className='sr-only'>
				<DialogTitle>{vi ? "Sự kiện trong ngày" : "Events on this day"}</DialogTitle>
				<DialogDescription className='text-slate-500'>
					{day.events.map((event) => event.name[locale]).join(" · ")}
				</DialogDescription>
			</DialogHeader>
			<div className='divide-y divide-gray-200'>
				{day.events.map((event) => <section key={event.id} className='space-y-4 py-6 first:pt-0 last:pb-0'>
					<header className='space-y-1 pr-9'>
						<h3 className='text-[17px] font-semibold leading-snug tracking-tight'>{event.name[locale]}</h3>
						<p className='text-[13px] leading-5 text-slate-500'>{event.date.calendar === "solar" ? dateLabel : `${vi ? "Âm lịch" : "Lunar date"}: ${day.lunar.day}/${day.lunar.month}/${day.lunar.year}${day.lunar.isLeapMonth ? (vi ? " (nhuận)" : " (leap)") : ""}`}</p>
						<p className='text-xs leading-relaxed text-slate-500'>{categoryLabels[event.category]} · {event.date.calendar === "solar" ? (vi ? "Theo dương lịch" : "Solar calendar") : (vi ? "Theo âm lịch" : "Lunar calendar")}</p>
					</header>
					<p className='text-sm leading-6'>{eventDetails[event.id as keyof typeof eventDetails]?.[locale]}</p>
					{vi && event.notes && <p className='text-[13px] leading-5 text-slate-500'>{event.notes}</p>}
					<figure>
						{/* Local assets are shared by Next.js and the packaged Capacitor app. */}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={event.image.src} alt={event.image.alt[locale]} width={event.image.width} height={event.image.height} className='aspect-video w-full rounded-2xl border border-gray-200 bg-slate-50 object-cover shadow-sm' />
					</figure>
				</section>)}
			</div>
		</DialogContent>
	</Dialog>;
}
