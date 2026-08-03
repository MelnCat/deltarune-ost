import { defineConfig, type PluginOption } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { readFileSync } from "node:fs";

const serveExtraFlac: () => PluginOption = () => ({
	name: "serve-extra-flac",
	configureServer(server) {
		server.middlewares.use(async (req, res, next) => {
			if (!req.url) return next();
			const pathname = req.url.split("?")[0];
			if (!pathname.endsWith(".flac")) return next();
			if (req.headers["sec-fetch-dest"] === "script") return next();
			const filePath = path.join(process.cwd(), pathname.slice(1));
			try {
				const contents = readFileSync(filePath);
				res.statusCode = 200;
				res.setHeader("Content-Type", "audio/flac");
				res.setHeader("Content-Length", contents.byteLength);
				res.end(contents);
			} catch {
				next();
			}
		});
	},
});

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [devtools(), serveExtraFlac(), nitro({ rollupConfig: { external: [/^@sentry\//] } }), tanstackStart(), viteReact()],
	assetsInclude: ["**/*.flac"]
});

export default config;
