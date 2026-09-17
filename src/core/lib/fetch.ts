import { logger } from "./logger";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type NextCacheConfig =
	| { cache: "force-cache" }
	| { cache: "no-store" }
	| { next: { revalidate: number; tags?: string[] } }
	| { next: { tags: string[]; revalidate?: number } };

interface FetchOptions<TBody = unknown> {
	method?: HttpMethod;
	params?: Record<string, string | number | boolean | null | undefined>;
	body?: TBody;
	headers?: Record<string, string>;
	caching?: NextCacheConfig;
	baseUrl?: string;
	/** Friendly name shown in logs */
	loggerLabel?: string;
	showLogger?: boolean;
	/** Milliseconds before aborting — uses AbortController, compatible with Next.js fetch */
	timeout?: number;
	/** If false, returns error object instead of throwing (default: true) */
	throwError?: boolean;
}

interface ApiResponse<TData> {
	data: TData | null;
	status: number;
	ok: true;
}

interface ApiErrorResponse {
	data: null;
	error: FetchError;
	status: number;
	ok: false;
}

class FetchError extends Error {
	constructor(
		public readonly status: number,
		public readonly statusText: string,
		public readonly body: unknown,
	) {
		super(`HTTP ${status}: ${statusText}`);
		this.name = "FetchError";
	}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUrl(endpoint: string, baseUrl: string, params?: FetchOptions["params"]): string {
	const isAbsolute = /^https?:\/\//.test(endpoint);
	const raw = isAbsolute ? endpoint : `${baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

	let url: URL;
	try {
		url = new URL(raw);
	} catch {
		logger.error(`[buildUrl] Invalid URL — endpoint: "${endpoint}", baseUrl: "${baseUrl}"`);
		throw new Error(`Invalid URL: "${raw}"`);
	}

	// value != null filters both null and undefined
	if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));

	return url.toString();
}

function buildNextConfig(caching?: NextCacheConfig): RequestInit {
	if (!caching) return { next: { revalidate: 0 } };
	if ("cache" in caching) return { cache: caching.cache };
	return { next: caching.next };
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
	return { "Content-Type": "application/json", Accept: "application/json", ...extra };
}

// ─── Core Fetcher ─────────────────────────────────────────────────────────────
export async function sendRequest<TData = unknown, TBody = unknown>(
	endpoint: string,
	options: FetchOptions<TBody> = {},
): Promise<ApiResponse<TData> | ApiErrorResponse> {
	const {
		method = "GET",
		params,
		body,
		headers: extraHeaders,
		caching,
		baseUrl = BASE_URL,
		loggerLabel,
		showLogger,
		timeout,
		throwError = true,
	} = options;

	const url = buildUrl(endpoint, baseUrl, params);
	const headers = buildHeaders(extraHeaders);

	// AbortController for timeout — Next.js extended fetch still respects signal
	const controller = timeout != null ? new AbortController() : null;
	const timer = controller ? setTimeout(() => controller.abort(), timeout) : null;

	let response: Response;
	try {
		response = await fetch(url, {
			method,
			headers,
			...buildNextConfig(caching),
			...(body !== undefined && { body: JSON.stringify(body) }),
			...(controller && { signal: controller.signal }),
		});

		const logBase = [
			...(loggerLabel ? [`\n[Send Request Logger]: ${loggerLabel}`] : []),
			"\n\nRequest ------",
			`\n[URL]: ${url}`,
			`\n[Method]: ${method}`,
			`\n[Status] : ${response.status}`,
			`\n[Headers]:`,
			headers,
			...(body !== undefined ? [`\n[req body]:`, body] : []),
			"\n\nResponse ------",
			`\n[Headers]:`,
			Object.fromEntries(response.headers.entries()),
		];

		if (!response.ok) {
			const text = await response.text();
			let errorBody: unknown = text;
			try {
				errorBody = JSON.parse(text);
			} catch {}

			const fetchError = new FetchError(response.status, response.statusText, errorBody);
			const errorResponse: ApiErrorResponse = {
				data: null,
				error: fetchError,
				status: response.status,
				ok: false,
			};
			if (showLogger) logger.error(...logBase, `\n[Response]:`, errorResponse, "------\n");
			if (!throwError) return errorResponse;
			throw fetchError;
		}

		const text = await response.text();
		let data: TData | null = null;

		if (text.trim()) {
			try {
				data = JSON.parse(text) as TData;
			} catch {
				throw new FetchError(response.status, "Invalid JSON Response", text);
			}
		}

		if (showLogger) logger.info(...logBase, `\n[Response]:`, data, "------\n");

		return { data, status: response.status, ok: true };
	} catch (err) {
		const isTimeout = controller?.signal.aborted === true;
		const error =
			err instanceof FetchError
				? err
				: new FetchError(isTimeout ? 408 : 0, isTimeout ? "Request Timeout" : "Network Error", null);

		if (isTimeout) {
			logger.error(`[timeout] ${timeout}ms exceeded — ${method} ${url}`);
		}

		if (!throwError) return { data: null, error, status: error.status, ok: false };
		throw error;
	} finally {
		if (timer) clearTimeout(timer);
	}
}
