import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { defaultLocale, isLocale } from "@/i18n/config";
import LocaleProvider from "@/i18n/LocaleProvider";
import type { Metadata, Viewport } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Inter } from "next/font/google";
import "./globals.css";

const font = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("Metadata");
	return {
		title: t("title"),
		description: t("description"),
		manifest: "/pwa/manifest.webmanifest",
		icons: {
			icon: [
				{ url: "/pwa/icons/icon0.svg", type: "image/svg+xml" },
				{ url: "/pwa/icons/icon1.png", type: "image/png" },
			],
			apple: "/pwa/icons/apple-icon.png",
		},
	};
}

export const viewport: Viewport = {
	themeColor: "#faf3ed",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
	const resolvedLocale = await getLocale();
	const locale = isLocale(resolvedLocale) ? resolvedLocale : defaultLocale;
	return (
		<html lang={locale} className={`${font.variable} h-full antialiased`}>
			<body>
				<LocaleProvider initialLocale={locale}>
					<div className='absolute right-4 top-4 z-10'>
						<LanguageSwitcher />
					</div>
					{children}
				</LocaleProvider>
			</body>
		</html>
	);
}
