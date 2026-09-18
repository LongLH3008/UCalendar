import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
	root: "mobile",
	publicDir: "../public",
	base: "./",
	resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
	plugins: [tailwindcss()],
	define: { "process.env.NODE_ENV": JSON.stringify("production") },
	build: { outDir: "../mobile-dist", emptyOutDir: true },
});
