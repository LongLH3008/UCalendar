"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Page() {
	const t = useTranslations("Home");
	return (
		<main className='flex min-h-screen flex-col items-center justify-center gap-4 px-4 font-sans text-[#153157]'>
			<h1 className='text-3xl font-bold'>{t("title")}</h1>
			<p className='text-center'>{t("description")}</p>
			<Link href='/calendar' className='rounded-lg bg-[#153157] px-4 py-2 text-white'>
				{t("openCalendar")}
			</Link>
		</main>
	);
}
