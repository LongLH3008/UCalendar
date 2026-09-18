import { createSerwistRoute } from "@serwist/turbopack";
import { randomUUID } from "node:crypto";

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
	swSrc: "src/app/sw.ts",
	useNativeEsbuild: true,
	additionalPrecacheEntries: [{ url: "/calendar", revision: randomUUID() }],
	globPatterns: [
		".next/static/**/*.{js,css,woff,woff2,ttf,otf}",
		"public/pwa/**/*.{html,json,webmanifest,png,svg,ico}",
		"public/event/**/*.{jpg,jpeg,png,webp}",
	],
});
