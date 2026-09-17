import { Temporal } from "@js-temporal/polyfill";

export type LunarDate = {
	day: number;
	month: number;
	year: number;
	isLeapMonth: boolean;
};

// Modern Vietnamese calendar (UTC+7), using Ho Ngoc Duc's astronomical method.
// Reference: https://www.xemamlich.uhm.vn/calrules.html
// These simplified formulas are approximate, not a historical-calendar model.
const TIME_ZONE = 7;
const SYNODIC_MONTH = 29.530588853;
const EPOCH = 2415021.076998695;
const RAD = Math.PI / 180;

function julianDay(year: number, month: number, day: number) {
	const a = Math.floor((14 - month) / 12);
	const y = year + 4800 - a;
	const m = month + 12 * a - 3;
	return day + Math.floor((153 * m + 2) / 5) + 365 * y
		+ Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function newMoonDay(k: number) {
	const t = k / 1236.85;
	const t2 = t * t;
	const t3 = t2 * t;
	const sin = (degrees: number) => Math.sin(degrees * RAD);
	const mean = 2415020.75933 + 29.53058868 * k + 0.0001178 * t2 - 0.000000155 * t3
		+ 0.00033 * sin(166.56 + 132.87 * t - 0.009173 * t2);
	const sun = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;
	const moon = 306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;
	const latitude = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;
	const correction = (0.1734 - 0.000393 * t) * sin(sun) + 0.0021 * sin(2 * sun)
		- 0.4068 * sin(moon) + 0.0161 * sin(2 * moon) - 0.0004 * sin(3 * moon)
		+ 0.0104 * sin(2 * latitude) - 0.0051 * sin(sun + moon) - 0.0074 * sin(sun - moon)
		+ 0.0004 * sin(2 * latitude + sun) - 0.0004 * sin(2 * latitude - sun)
		- 0.0006 * sin(2 * latitude + moon) + 0.0010 * sin(2 * latitude - moon)
		+ 0.0005 * sin(2 * moon + sun);
	const delta = t < -11
		? 0.001 + 0.000839 * t + 0.0002261 * t2 - 0.00000845 * t3 - 0.000000081 * t * t3
		: -0.000278 + 0.000265 * t + 0.000262 * t2;
	return Math.floor(mean + correction - delta + 0.5 + TIME_ZONE / 24);
}

function solarSector(day: number) {
	const t = (day - 2451545.5 - TIME_ZONE / 24) / 36525;
	const t2 = t * t;
	const anomaly = (357.52910 + 35999.05030 * t - 0.0001559 * t2 - 0.00000048 * t * t2) * RAD;
	const longitude = (280.46645 + 36000.76983 * t + 0.0003032 * t2
		+ (1.914600 - 0.004817 * t - 0.000014 * t2) * Math.sin(anomaly)
		+ (0.019993 - 0.000101 * t) * Math.sin(2 * anomaly)
		+ 0.000290 * Math.sin(3 * anomaly)) * RAD;
	const normalized = longitude - 2 * Math.PI * Math.floor(longitude / (2 * Math.PI));
	return Math.floor(normalized / Math.PI * 6);
}

function month11(year: number) {
	const k = Math.floor((julianDay(year, 12, 31) - 2415021) / SYNODIC_MONTH);
	const start = newMoonDay(k);
	return solarSector(start) >= 9 ? newMoonDay(k - 1) : start;
}

function leapOffset(start: number) {
	const k = Math.floor((start - EPOCH) / SYNODIC_MONTH + 0.5);
	let previous = solarSector(newMoonDay(k + 1));
	for (let offset = 2; offset <= 14; offset++) {
		const sector = solarSector(newMoonDay(k + offset));
		if (sector === previous || offset === 14) return offset - 1;
		previous = sector;
	}
	throw new Error("Unable to determine lunar leap month");
}

export function solarToLunar(year: number, month: number, day: number): LunarDate {
	// Reject invalid dates instead of silently clamping them.
	Temporal.PlainDate.from({ year, month, day }, { overflow: "reject" });
	const dayNumber = julianDay(year, month, day);
	let k = Math.floor((dayNumber - EPOCH) / SYNODIC_MONTH);
	let start = newMoonDay(k);
	// The mean-cycle estimate can land on either side of the actual new moon.
	while (start > dayNumber) start = newMoonDay(--k);
	while (newMoonDay(k + 1) <= dayNumber) start = newMoonDay(++k);
	let a11 = month11(year);
	let b11 = a11;
	let lunarYear = year;
	if (a11 >= start) {
		a11 = month11(year - 1);
	} else {
		lunarYear++;
		b11 = month11(year + 1);
	}
	const diff = Math.floor((start - a11) / 29);
	let lunarMonth = diff + 11;
	let isLeapMonth = false;
	if (b11 - a11 > 365) {
		const leap = leapOffset(a11);
		if (diff >= leap) {
			lunarMonth = diff + 10;
			isLeapMonth = diff === leap;
		}
	}
	if (lunarMonth > 12) lunarMonth -= 12;
	if (lunarMonth >= 11 && diff < 4) lunarYear--;
	return { day: dayNumber - start + 1, month: lunarMonth, year: lunarYear, isLeapMonth };
}
