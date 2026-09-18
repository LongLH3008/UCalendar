import { expect, test } from "@playwright/test";
import { vietnamEvents } from "../src/core/calendar-events/vietnam-events";

test("mobile bundle includes all event images and the dialog displays the matching image", async ({ page, request }) => {
	for (const event of vietnamEvents) {
		const response = await request.get(event.image.src);
		expect(response.status(), event.id).toBe(200);
		expect(response.headers()["content-type"], event.id).toMatch(/^image\//);
	}
	await page.clock.setFixedTime(new Date("2026-02-17T09:00:00+07:00"));
	await page.goto("/");
	await page.getByRole("button", { name: /Valentine's Day/ }).tap();
	const dialog = page.getByRole("dialog");
	await expect(dialog.getByText("February 14, 2026", { exact: true })).toBeVisible();
	await expect(dialog).not.toContainText("Lunar date");
	await expect(dialog.locator("figcaption")).toHaveCount(0);
	const calendarBounds = await page.locator("article > div").first().boundingBox();
	await expect.poll(async () => (await dialog.boundingBox())!.width).toBeCloseTo(calendarBounds!.width, 1);
	const image = page.getByRole("dialog").getByRole("img");
	await expect(image).toHaveAttribute("src", "/event/valentines-day.jpg");
	await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
	await page.keyboard.press("Escape");
	await page.getByRole("combobox").selectOption("vi");
	await page.getByRole("button", { name: /Tết Nguyên đán/ }).tap();
	await expect(dialog.getByText("Âm lịch: 1/1/2026", { exact: true })).toBeVisible();
	await expect(dialog).not.toContainText("17 tháng 2");
	await expect(image).toHaveAttribute("src", "/event/tet.jpg");
	await expect(image).toHaveAttribute("alt", "Đường hoa Nguyễn Huệ trong dịp Tết Nguyên đán");
	await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
});

test("event cells open localized details by touch offline and restore focus", async ({ page, context }) => {
	await page.clock.setFixedTime(new Date("2026-02-17T09:00:00+07:00"));
	await page.goto("/");
	await context.setOffline(true);
	const solar = page.getByRole("button", { name: /Valentine's Day/ });
	await solar.tap();
	const dialog = page.getByRole("dialog");
	await expect(dialog.getByRole("heading", { name: "Valentine's Day" })).toBeVisible();
	await expect(dialog.getByText("A day to express love and affection through greetings, gifts and time together.")).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(dialog).toBeHidden();
	await expect(solar).toBeFocused();
	await page.getByRole("combobox").selectOption("vi");
	await page.getByRole("button", { name: /Tết Nguyên đán/ }).tap();
	await expect(dialog.getByRole("heading", { name: "Tết Nguyên đán" })).toBeVisible();
	await expect(dialog.getByText(/Tết cổ truyền mở đầu năm âm lịch/)).toBeVisible();
	await expect(dialog.getByText(/Theo âm lịch/)).toBeVisible();
	await dialog.getByRole("button", { name: "Close", exact: true }).tap();
	await expect(dialog).toBeHidden();
});

test("packaged calendar keeps navigating and translating offline", async ({ page, context }) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/");
	const heading = page.locator("article h5");
	await expect(heading).toBeVisible();
	const initial = await heading.textContent();
	await context.setOffline(true);
	await page.getByRole("button", { name: "Next month", exact: true }).click();
	await expect(heading).not.toHaveText(initial!);
	await page.getByRole("button", { name: "Previous month", exact: true }).click();
	await expect(heading).toHaveText(initial!);
	await page.getByRole("combobox").selectOption("vi");
	await expect(page.getByText("Nhắc offline khi đóng app khả dụng trong bản Android/iOS.")).toBeVisible();
	await expect(heading).not.toHaveText(initial!);
	expect(errors).toEqual([]);
});
