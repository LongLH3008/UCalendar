import type { CalendarState } from "../calendar.types";
import { useTranslations } from "next-intl";

type Props = {
	onChangeMonth: CalendarState["changeMonth"];
};

export default function CalendarNavigation({ onChangeMonth }: Props) {
	const t = useTranslations("Calendar");
	return (
		<div className='w-full flex justify-between'>
			<button aria-label={t("previousLabel")} onClick={() => onChangeMonth("prev")}>{t("previous")}</button>
			<button aria-label={t("nextLabel")} onClick={() => onChangeMonth("next")}>{t("next")}</button>
		</div>
	);
}
