import type { CalendarState } from "../calendar.types";

type Props = {
	onChangeMonth: CalendarState["changeMonth"];
};

export default function CalendarNavigation({ onChangeMonth }: Props) {
	return (
		<div className='w-full flex justify-between'>
			<button onClick={() => onChangeMonth("prev")}>Prev</button>
			<button onClick={() => onChangeMonth("next")}>Next</button>
		</div>
	);
}
