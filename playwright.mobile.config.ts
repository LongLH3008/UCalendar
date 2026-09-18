import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	testMatch: "mobile-calendar.spec.ts",
	use: { baseURL: "http://127.0.0.1:3200", browserName: "chromium", viewport: { width: 390, height: 844 }, hasTouch: true },
	webServer: {
		command: "pnpm exec vite preview --config vite.mobile.config.mts --host 127.0.0.1 --port 3200",
		url: "http://127.0.0.1:3200",
		reuseExistingServer: false,
	},
});
