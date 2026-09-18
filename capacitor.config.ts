import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
	appId: "com.ucalendar.app",
	appName: "UCalendar",
	webDir: "mobile-dist",
	plugins: { LocalNotifications: { smallIcon: "ic_stat_calendar", iconColor: "#153157", presentationOptions: ["banner", "list", "sound"] } },
};

export default config;
