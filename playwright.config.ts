import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	use: {
		baseURL: "http://localhost:3100",
		browserName: "chromium",
		serviceWorkers: "allow",
	},
	webServer: {
		command: "pnpm start --port 3100",
		url: "http://localhost:3100/calendar",
		reuseExistingServer: false,
	},
});
