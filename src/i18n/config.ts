export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const localeCookie = "locale";
export const localeStorageKey = "ucalendar.locale";
export const localeMaxAge = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
	return value === "en" || value === "vi";
}
