import Heading from "@/components/shared/Heading";
import type { CalendarState } from "../calendar.types";

type Props = {
	currentTime: CalendarState["currentTime"];
};

export default function CalendarHeader({ currentTime }: Props) {
	return (
		<div className='w-full h-16 p-3 bg-[#153157] flex items-center'>
			<Heading as='h4' className='text-white font-bold leading-tight'>
				Tháng {currentTime.month} {currentTime.year}
			</Heading>
		</div>
	);
}
