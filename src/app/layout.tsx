import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const font = Roboto({
	variable: "--font-roboto",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "UCalendar",
	description: "UCalendar - Your Personal Calendar",
};

export const viewport: Viewport = {
	themeColor: "#faf3ed",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang='en' className={`${font.variable} h-full antialiased`}>
			<body className='min-h-full flex flex-col bg-white'>{children}</body>
		</html>
	);
}
