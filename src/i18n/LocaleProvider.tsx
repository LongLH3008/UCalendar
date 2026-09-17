"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { isLocale, localeCookie, localeMaxAge, localeStorageKey } from "./config";
import type { Locale } from "./config";
import en from "./messages/en.json";
import vi from "./messages/vi.json";

const messages = { en, vi };
const changeEvent = "ucalendar:locale-change";
const LocaleContext = createContext<((locale: Locale) => void) | null>(null);

function readLocale(fallback: Locale): Locale {
	try {
		const stored = localStorage.getItem(localeStorageKey);
		if (isLocale(stored)) return stored;
	} catch {
		// Cookies remain available when localStorage is disabled.
	}
	const cookie = document.cookie.split("; ").find((entry) => entry.startsWith(`${localeCookie}=`));
	const value = cookie?.slice(localeCookie.length + 1);
	return isLocale(value) ? value : fallback;
}

function subscribe(notify: () => void) {
	const onStorage = (event: StorageEvent) => {
		if (event.key === localeStorageKey || event.key === null) notify();
	};
	window.addEventListener(changeEvent, notify);
	window.addEventListener("storage", onStorage);
	return () => {
		window.removeEventListener(changeEvent, notify);
		window.removeEventListener("storage", onStorage);
	};
}

function writeCookie(locale: Locale) {
	const secure = window.location.protocol === "https:" ? "; Secure" : "";
	document.cookie = `${localeCookie}=${locale}; Path=/; Max-Age=${localeMaxAge}; SameSite=Lax${secure}`;
}

function changeLocale(locale: Locale) {
	if (!isLocale(locale)) return;
	try {
		localStorage.setItem(localeStorageKey, locale);
	} catch {
		// Keep changing the language through the cookie when storage is unavailable.
	}
	writeCookie(locale);
	window.dispatchEvent(new Event(changeEvent));
}

export function useChangeLocale() {
	const change = useContext(LocaleContext);
	if (!change) throw new Error("useChangeLocale must be used inside LocaleProvider.");
	return change;
}

export default function LocaleProvider({ children, initialLocale }: { children: ReactNode; initialLocale: Locale }) {
	const locale = useSyncExternalStore(subscribe, () => readLocale(initialLocale), () => initialLocale);

	useEffect(() => {
		writeCookie(locale);
		document.documentElement.lang = locale;
		document.title = messages[locale].Metadata.title;
		document.querySelector('meta[name="description"]')?.setAttribute("content", messages[locale].Metadata.description);
	}, [locale]);

	return (
		<LocaleContext.Provider value={changeLocale}>
			<NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone='Asia/Ho_Chi_Minh'>
				{children}
			</NextIntlClientProvider>
		</LocaleContext.Provider>
	);
}
