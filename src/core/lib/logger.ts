/** @example "[WaitForHydration]" "[UserService]" "[api/login]" */
const ts = { toString: () => new Date().toLocaleString("vi-VN") };
const IS_PROD = process.env.NODE_ENV === "production";
const noop = () => {};

const bind = (fn: typeof console.log, level: string, color: string, name?: string) =>
	IS_PROD ? noop : fn.bind(console, `%c${level} ${name ?? ""}%s`, color, "");

export const createLogger = (nameLogger?: `[${string}]`) => ({
	info: bind(console.log, `[LOG] <${ts}>`, "color: #4ade80; font-weight: bold", nameLogger),
	warn: bind(console.warn, `[WARN] <${ts}>`, "color: #facc15; font-weight: bold", nameLogger),
	error: bind(console.error, `[ERROR] <${ts}>`, "color: #f87171; font-weight: bold", nameLogger),
});

export const logger = createLogger();
