import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync(new URL("../src/core/calc/lunar.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
	compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const lunarModule = { exports: {} };
new Function("require", "module", "exports", compiled)(require, lunarModule, lunarModule.exports);
const { solarToLunar } = lunarModule.exports;

test("Vietnamese calendar reference dates, leap month and lunar year boundary", () => {
	// 1984/2004 examples: https://www.xemamlich.uhm.vn/calrules.html
	const fixtures = [
		[1983, 12, 4, 1, 11, 1983, false],
		[1984, 1, 3, 1, 12, 1983, false],
		[1984, 2, 2, 1, 1, 1984, false],
		[2004, 3, 21, 1, 2, 2004, true],
		[2004, 4, 18, 29, 2, 2004, true],
		[2004, 4, 19, 1, 3, 2004, false],
		[2024, 2, 10, 1, 1, 2024, false],
		[2025, 1, 29, 1, 1, 2025, false],
		[2026, 2, 16, 29, 12, 2025, false],
		[2026, 2, 17, 1, 1, 2026, false],
	];
	for (const [y, m, d, day, month, year, isLeapMonth] of fixtures) {
		assert.deepEqual(solarToLunar(y, m, d), { day, month, year, isLeapMonth }, `${y}-${m}-${d}`);
	}
});

test("consecutive dates have valid lunar days and 29/30-day months (1900–2099)", () => {
	let previous;
	for (let timestamp = Date.UTC(1900, 0, 1); timestamp < Date.UTC(2100, 0, 1); timestamp += 86400000) {
		const solar = new Date(timestamp);
		const lunar = solarToLunar(solar.getUTCFullYear(), solar.getUTCMonth() + 1, solar.getUTCDate());
		assert.ok(lunar.day >= 1 && lunar.day <= 30, `${solar.toISOString()}: ${JSON.stringify(lunar)}`);
		assert.ok(lunar.month >= 1 && lunar.month <= 12);
		if (previous) {
			if (lunar.day === 1) assert.ok(previous.day === 29 || previous.day === 30);
			else {
				assert.equal(lunar.day, previous.day + 1);
				assert.equal(lunar.month, previous.month);
				assert.equal(lunar.year, previous.year);
				assert.equal(lunar.isLeapMonth, previous.isLeapMonth);
			}
		}
		previous = lunar;
	}
});

test("invalid solar dates are rejected", () => {
	assert.throws(() => solarToLunar(2026, 2, 30), RangeError);
	assert.throws(() => solarToLunar(2026, 13, 1), RangeError);
});
