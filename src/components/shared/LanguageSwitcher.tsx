"use client";

import { useLocale, useTranslations } from "next-intl";
import { useChangeLocale } from "@/i18n/LocaleProvider";
import { isLocale } from "@/i18n/config";

export default function LanguageSwitcher() {
	const locale = useLocale();
	const t = useTranslations("Common");
	const changeLocale = useChangeLocale();

	return (
		<label className='flex items-center gap-2 text-sm font-sans text-[#153157]'>
			<span>{t("language")}</span>
			<select
				value={locale}
				className='rounded-lg border border-gray-200 bg-white px-2 py-1 focus-visible:outline-2 focus-visible:outline-[#153157]'
				onChange={(event) => {
					if (isLocale(event.target.value)) changeLocale(event.target.value);
				}}
			>
				<option value='en'>English</option>
				<option value='vi'>Tiếng Việt</option>
			</select>
		</label>
	);
}
