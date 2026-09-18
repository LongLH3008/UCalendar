/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import { Serwist, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";

declare global {
	interface WorkerGlobalScope extends SerwistGlobalConfig {
		__SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
	}
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	// Activate updates after existing windows close so HTML and assets stay on the same build.
	skipWaiting: false,
	clientsClaim: true,
	navigationPreload: true,
	runtimeCaching: defaultCache,
	fallbacks: {
		entries: [{
			url: "/calendar",
			matcher: ({ request }) => {
				const { pathname } = new URL(request.url);
				return request.destination === "document" &&
					(pathname === "/calendar" || pathname === "/calendar/");
			},
		}],
	},
});

// Remove the previous offline-notice cache after the new worker takes over.
self.addEventListener("activate", (event) => {
	event.waitUntil(caches.keys().then((names) => Promise.all(
		names.filter((name) => name.startsWith("ucalendar-offline-")).map((name) => caches.delete(name)),
	)));
});

serwist.addEventListeners();
