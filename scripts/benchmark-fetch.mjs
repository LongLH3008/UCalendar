import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = await fs.readFile(path.join(root, "src/core/lib/fetch.ts"), "utf8");
const payload = JSON.stringify({ id: 1, payload: "x".repeat(2048) });

function summarize(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    medianMs: sorted[Math.floor(sorted.length / 2)],
    meanMs: samples.reduce((sum, value) => sum + value, 0) / samples.length,
    p95Ms: sorted[Math.floor(sorted.length * 0.95)],
  };
}

// A fresh Response for every call isolates processing costs without network I/O.
const fakeFetch = async () => new Response(payload, { headers: { "Content-Type": "application/json" } });
const exports = {};
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
}).outputText;
new Function("exports", "require", "fetch", code)(
  exports, () => ({ logger: { info() {}, error() {} } }), fakeFetch,
);
const fakeUrl = "http://127.0.0.1/items";
const microVariants = {
  "fetch + json": async () => (await fakeFetch()).json(),
  "fetch + text/parse": async () => JSON.parse(await (await fakeFetch()).text()),
  sendRequest: async () => (await exports.sendRequest(fakeUrl)).data,
  "sendRequest + timeout": async () => (await exports.sendRequest(fakeUrl, { timeout: 5000 })).data,
};
const microSamples = Object.fromEntries(Object.keys(microVariants).map((key) => [key, []]));
for (const run of Object.values(microVariants)) {
  for (let i = 0; i < 300; i++) assert.equal((await run()).id, 1);
}
for (let round = 0; round < 12; round++) {
  const names = Object.keys(microVariants);
  for (let offset = 0; offset < names.length; offset++) {
    const name = names[(round + offset) % names.length];
    const start = performance.now();
    for (let i = 0; i < 500; i++) assert.equal((await microVariants[name]()).id, 1);
    microSamples[name].push((performance.now() - start) / 500);
  }
}
const micro = Object.fromEntries(Object.entries(microSamples).map(([key, samples]) => [key, summarize(samples)]));
console.log("Processing only, 6000 calls/variant; median of 12 batch means:");
console.table(micro);

const api = http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  const body = url.searchParams.get("size") === "large"
    ? JSON.stringify({ id: 1, payload: "x".repeat(128 * 1024) }) : payload;
  const reply = () => {
    response.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    response.end(body);
  };
  const delay = Number(url.searchParams.get("delay") ?? 0);
  if (delay) setTimeout(reply, delay);
  else reply();
});
await new Promise((resolve) => api.listen(0, "127.0.0.1", resolve));
const apiUrl = `http://127.0.0.1:${api.address().port}/items`;
const tempRoot = path.join(root, "benchmarks");
await fs.mkdir(tempRoot, { recursive: true });
const project = await fs.mkdtemp(path.join(tempRoot, "fetch-tmp-"));
let nextProcess;

function runNext(args, env = {}) {
  const child = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), ...args], {
    cwd: project,
    env: { ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1", ...env },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  const done = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve(output) : reject(new Error(output)));
  });
  return { child, done, output: () => output };
}

try {
  const routeDirectory = path.join(project, "app/api/bench");
  await fs.mkdir(routeDirectory, { recursive: true });
  const importPath = path.relative(routeDirectory, path.join(root, "src/core/lib/fetch.ts")).replaceAll("\\", "/");
  await fs.writeFile(path.join(project, "package.json"), JSON.stringify({ name: "fetch-benchmark", private: true }));
  await fs.writeFile(path.join(project, "next.config.mjs"), `export default { turbopack: { root: ${JSON.stringify(root)} } };`);
  await fs.writeFile(path.join(routeDirectory, "route.js"), `
import { sendRequest } from ${JSON.stringify(importPath)};
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(request) {
  const input = new URL(request.url).searchParams;
  const url = process.env.BENCH_API_URL + "?delay=" + input.get("delay") + "&size=" + input.get("size");
  const iterations = Number(input.get("iterations"));
  const init = { method: "GET", headers: { "Content-Type": "application/json", Accept: "application/json" }, next: { revalidate: 0 } };
  const variants = {
    "fetch + json": async () => (await fetch(url, init)).json(),
    "fetch + text/parse": async () => JSON.parse(await (await fetch(url, init)).text()),
    sendRequest: async () => (await sendRequest(url, { showLogger: false })).data,
    "sendRequest + timeout": async () => (await sendRequest(url, { showLogger: false, timeout: 5000 })).data,
  };
  const samples = Object.fromEntries(Object.keys(variants).map(key => [key, []]));
  for (const run of Object.values(variants)) for (let i = 0; i < 10; i++) await run();
  const names = Object.keys(variants);
  for (let round = 0; round < 6; round++) {
    for (let i = 0; i < iterations; i++) {
      for (let offset = 0; offset < names.length; offset++) {
        const name = names[(round + i + offset) % names.length];
        const start = performance.now();
        const data = await variants[name]();
        if (data.id !== 1) throw new Error("Unexpected response");
        samples[name].push(performance.now() - start);
      }
    }
  }
  return Response.json({ samples, requestsPerVariant: 6 * iterations });
}
`);
  console.log("Building isolated Next.js production benchmark (no application source changes)...");
  await runNext(["build"]).done;
  const probe = http.createServer();
  await new Promise((resolve) => probe.listen(0, "127.0.0.1", resolve));
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  const next = runNext(["start", "--hostname", "127.0.0.1", "--port", String(port)], { BENCH_API_URL: apiUrl });
  nextProcess = next.child;
  // Attach immediately so process shutdown cannot cause an unhandled rejection.
  next.done.catch(() => {});
  const endpoint = `http://127.0.0.1:${port}/api/bench`;
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await fetch(`${endpoint}?delay=0&size=small&iterations=0`);
      if (response.ok) { await response.arrayBuffer(); ready = true; break; }
    } catch {}
    if (nextProcess.exitCode !== null) throw new Error(next.output());
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error("Next.js benchmark server did not start: " + next.output());
  const network = [];
  for (const scenario of [
    { label: "2 KiB, localhost", delay: 0, size: "small", iterations: 60 },
    { label: "2 KiB, 20 ms server delay", delay: 20, size: "small", iterations: 20 },
    { label: "128 KiB, localhost", delay: 0, size: "large", iterations: 30 },
  ]) {
    console.log("Measuring " + scenario.label + "...");
    const response = await fetch(`${endpoint}?delay=${scenario.delay}&size=${scenario.size}&iterations=${scenario.iterations}`);
    if (!response.ok) throw new Error(await response.text());
    const result = await response.json();
    const stats = Object.fromEntries(Object.entries(result.samples).map(([key, samples]) => [key, summarize(samples)]));
    network.push({ scenario: scenario.label, requestsPerVariant: result.requestsPerVariant, stats });
    console.table(stats);
  }
  const report = {
    createdAt: new Date().toISOString(), node: process.version, next: "16.3.5",
    conditions: "Next.js production Route Handler; localhost HTTP; sequential requests, rotated order, warmup, logging off, revalidate=0 for every variant. No Server Component memoization/cache-hit measurement.",
    micro: { callsPerVariant: 6000, statistic: "median of 12 batch means", stats: micro },
    network,
  };
  const reportPath = path.join(tempRoot, "fetch-results.json");
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log("Report: " + reportPath);
} finally {
  if (nextProcess && nextProcess.exitCode === null) {
    const stopped = new Promise((resolve) => nextProcess.once("exit", resolve));
    nextProcess.kill();
    await stopped;
  }
  api.closeAllConnections();
  await new Promise((resolve) => api.close(resolve));
  // Recursive cleanup is restricted to the uniquely created benchmark directory.
  const resolvedProject = path.resolve(project);
  if (path.dirname(resolvedProject) !== path.resolve(tempRoot) || !path.basename(resolvedProject).startsWith("fetch-tmp-")) {
    throw new Error("Unsafe cleanup target: " + resolvedProject);
  }
  await fs.rm(resolvedProject, { recursive: true, force: true });
}
