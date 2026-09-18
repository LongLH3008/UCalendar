import { expect, test } from "@playwright/test";
import { vietnamEvents } from "../src/core/calendar-events/vietnam-events";

test("all event images are precached and an unseen event dialog displays its image offline", async ({ page, context }) => {
	await page.clock.setFixedTime(new Date("2026-02-17T09:00:00+07:00"));
	await page.goto("/calendar");
	await page.evaluate(async () => { await navigator.serviceWorker.ready; });
	await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
	await context.setOffline(true);
	const results = await page.evaluate(async (urls) => Promise.all(urls.map(async (url) => {
		const response = await fetch(url);
		return { url, status: response.status, type: response.headers.get("content-type"), bytes: (await response.blob()).size };
	})), vietnamEvents.map((event) => event.image.src));
	expect(results).toHaveLength(36);
	for (const result of results) {
		expect(result.status, result.url).toBe(200);
		expect(result.type, result.url).toMatch(/^image\//);
		expect(result.bytes, result.url).toBeGreaterThan(0);
	}
	await page.getByRole("button", { name: /Vietnamese Lunar New Year/ }).click();
	const image = page.getByRole("dialog").getByRole("img");
	await expect(image).toHaveAttribute("src", "/event/tet-16x9.webp");
	await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
});

test("calendar can reload and reopen offline after its first online visit", async ({ page, context }) => {
	await page.goto("/calendar");
	const heading = page.getByRole("article").getByRole("heading");
	await expect(heading).toBeVisible();
	const currentMonth = await heading.innerText();

	// Installation must finish before disconnecting: it precaches the document and all assets.
	await page.evaluate(async () => { await navigator.serviceWorker.ready; });
	await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
	await context.setOffline(true);
	const reloadResponse = await page.reload();
	expect(reloadResponse?.fromServiceWorker()).toBe(true);
	await expect(heading).toHaveText(currentMonth);
	await page.getByRole("button", { name: "Next month", exact: true }).click();
	await expect(heading).not.toHaveText(currentMonth);
	await page.getByRole("button", { name: "Previous month", exact: true }).click();
	await expect(heading).toHaveText(currentMonth);

	await page.close();
	const reopened = await context.newPage();
	const reopenedResponse = await reopened.goto("/calendar");
	expect(reopenedResponse?.fromServiceWorker()).toBe(true);
	await expect(reopened.getByRole("article").getByRole("heading")).toHaveText(currentMonth);
	await reopened.getByRole("button", { name: "Next month", exact: true }).click();
	await expect(reopened.getByRole("article").getByRole("heading")).not.toHaveText(currentMonth);
});

test("legacy start URL and Vietnamese calendar work offline", async ({ page, context }) => {
	await context.addCookies([{ name: "locale", value: "vi", url: "http://localhost:3100" }]);
	await page.goto("/calendar/");
	await page.evaluate(async () => { await navigator.serviceWorker.ready; });
	await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
	await context.setOffline(true);
	await page.goto("/calendar/");
	const heading = page.getByRole("article").getByRole("heading");
	await expect(heading).toContainText(/tháng/i);
	const currentMonth = await heading.innerText();
	await page.getByRole("button", { name: "Tháng sau", exact: true }).click();
	await expect(heading).not.toHaveText(currentMonth);
});
