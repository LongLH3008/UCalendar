"use client";

import { generateMonthCalendar } from "@/core/calc/generate";
import { useState } from "react";

const Page = () => {
	const [currentTime, setCurrentTime] = useState<{ month: number; year: number }>({
		month: new Date().getMonth() + 1,
		year: new Date().getFullYear(),
	});

	const changeMonth = (action: "next" | "prev") => {
		if (action === "next") {
			if (currentTime.month === 12) {
				setCurrentTime({ month: 1, year: currentTime.year + 1 });
			} else {
				setCurrentTime({ month: currentTime.month + 1, year: currentTime.year });
			}
		}

		if (action === "prev") {
			if (currentTime.month === 1) {
				setCurrentTime({ month: 12, year: currentTime.year - 1 });
			} else {
				setCurrentTime({ month: currentTime.month - 1, year: currentTime.year });
			}
		}
	};

	const calendarWeeks = generateMonthCalendar(currentTime.year, currentTime.month);
	console.log(calendarWeeks);

	return (
		<div className='h-screen flex justify-center items-center'>
			<div className='fixed top-5 left-5'>
				{currentTime.month} / {currentTime.year}
			</div>
			<button onClick={() => changeMonth("prev")}>Prev</button>
			<div className='bg-white text-black container max-w-2xl w-full border p-1 mx-auto'>
				<div className='grid aspect-7/6 grid-rows-6'>
					{calendarWeeks.map((week) => (
						<div
							key={week[0].dateString}
							className='grid min-h-0 grid-cols-7 *:min-w-0 *:border'
						>
							{week.map((day) => (
								<div key={day.dateString} className='flex flex-col p-1'>
									<span>{day.solar}</span>
									<span className='text-xs text-gray-500'>
										{day.lunar.day === 1 ? `1/${day.lunar.month}` : day.lunar.day}
										{day.lunar.isLeapMonth ? " N" : ""}
									</span>
								</div>
							))}
						</div>
					))}
				</div>
			</div>
			<button onClick={() => changeMonth("next")}>Next</button>
		</div>
	);
};

export default Page;
