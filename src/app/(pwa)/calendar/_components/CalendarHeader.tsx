import Heading from "@/components/shared/Heading";
import { useFormatter } from "next-intl";
import type { CalendarState } from "../calendar.types";

type Props = {
	currentTime: CalendarState["currentTime"];
};

export default function CalendarHeader({ currentTime }: Props) {
	const format = useFormatter();
	const month = new Date(Date.UTC(currentTime.year, currentTime.month - 1, 1));
	return (
		<div className='w-full h-16 p-3 bg-[#153157] flex items-center'>
			<Heading as='h4' className='text-white font-bold leading-tight'>
				{format.dateTime(month, { month: "long", year: "numeric", timeZone: "UTC" })}
			</Heading>
		</div>
	);
}
