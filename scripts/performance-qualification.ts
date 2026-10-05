import { createHash } from "node:crypto";
import { writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";
import { cpus, platform, release, arch, totalmem } from "node:os";
import { validatePipeline } from "../packages/validator/src/index.ts";
import { layoutDiagram } from "../packages/layout/src/index.ts";
import { renderDiagram } from "../packages/renderer/src/index.ts";
import { createSelfContainedHtml, search, focus, route, reach } from "../packages/viewer-runtime/src/index.ts";
import { exportHtml, exportSvg } from "../packages/exporter/src/index.ts";
import { analyzeRepository } from "../packages/analyzer/src/index.ts";
import type { DiagramIR } from "../packages/ir/src/index.ts";

const ROLES = ["component","service","runtime","external","store","database","queue","agent","model","tool"] as const;
const seed = "deterministic-indexed-v1";
function fixture(nodes: number, relationships: number): DiagramIR {
  const ns = Array.from({ length: nodes }, (_, i) => ({ id: `n${i}`, type: ROLES[i % ROLES.length], label: `Service ${String(i).padStart(4, "0")}` }));
  const rs = Array.from({ length: relationships }, (_, i) => {
    const source = i % nodes;
    const target = (source + 1 + Math.floor(i / nodes)) % nodes;
    return { id: `r${i}`, source: `n${source}`, target: `n${target === source ? (source + 1) % nodes : target}`, type: "calls" };
  });
  return { version: "1.0", kind: "architecture", document: { title: `perf ${nodes}n ${relationships}e` }, nodes: ns, relationships: rs, boundaries: [], evidence: [], presentation: {} };
}
function hash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
function stats(samples: number[]) {
  const s = [...samples].sort((a, b) => a - b);
  const mean = s.reduce((a, b) => a + b, 0) / s.length;
  const p = (q: number) => s[Math.min(s.length - 1, Math.ceil(q * s.length) - 1)];
  return { samples: s.map(n => Number(n.toFixed(3))), min: Number(s[0].toFixed(3)), median: Number(p(0.5).toFixed(3)), p95: Number(p(0.95).toFixed(3)), max: Number(s.at(-1)!.toFixed(3)), mean: Number(mean.toFixed(3)) };
}
async function time(fn: () => unknown | Promise<unknown>, warmup: number, reps: number) {
  for (let i = 0; i < warmup; i++) await fn();
  const samples: number[] = [];
  for (let i = 0; i < reps; i++) {
    const t = performance.now();
    await fn();
    samples.push(performance.now() - t);
  }
  return stats(samples);
}
const workloads = [
  { name: "nodes-100", nodes: 100, relationships: 100 },
  { name: "nodes-500", nodes: 500, relationships: 500 },
  { name: "nodes-1000", nodes: 1000, relationships: 1000 },
  { name: "relationships-5000", nodes: 1000, relationships: 5000 },
];
const warmup = 1, reps = 7;
const results: any[] = [];
for (const w of workloads) {
  const ir = fixture(w.nodes, w.relationships);
  const fixtureHash = hash(ir);
  const built = JSON.stringify(ir);
  const parse = await time(() => JSON.parse(built) as DiagramIR, warmup, reps);
  const validation = await time(() => validatePipeline(ir), warmup, reps);
  const layout = await time(() => layoutDiagram(ir), 1, 3);
  const laid = layoutDiagram(ir);
  const render = await time(() => renderDiagram(ir, laid), warmup, reps);
  const html = await time(() => createSelfContainedHtml(ir, laid), warmup, reps);
  const svg = await time(() => exportSvg(ir, laid), warmup, reps);
  const htmlExport = await time(() => exportHtml(ir, laid), warmup, reps);
  const searchStats = await time(() => search(ir, "Service 0050"), warmup, reps);
  const focusStats = await time(() => focus(ir, "n50"), warmup, reps);
  const routeStats = await time(() => route(ir, "n0", `n${Math.min(w.nodes - 1, 40)}`), warmup, reps);
  const reachStats = await time(() => reach(ir, "n0", "downstream"), warmup, reps);
  const again = layoutDiagram(ir);
  results.push({
    workload: w, seed, fixtureHash, geometryHash: laid.geometryHash, deterministic: laid.geometryHash === again.geometryHash,
    counts: { nodes: ir.nodes.length, relationships: ir.relationships.length, htmlBytes: createSelfContainedHtml(ir, laid).length, svgBytes: exportSvg(ir, laid).bytes.byteLength },
    operations: { parse, validation, layout, render, viewerHtml: html, exportSvg: svg, exportHtml: htmlExport, search: searchStats, focus: focusStats, route: routeStats, reach: reachStats },
    checks: { validationValid: validatePipeline(ir).valid, searchHit: search(ir, "Service 0050").includes("n50"), focusNode: focus(ir, "n50").node?.id === "n50", routeLength: route(ir, "n0", `n${Math.min(w.nodes - 1, 40)}`).length, reachCount: reach(ir, "n0", "downstream").length }
  });
  console.error("done", w.name, "valid", results.at(-1).checks.validationValid, "geom", laid.geometryHash);
}
await writeFile("/tmp/perf-out/performance-qualification.partial.json", JSON.stringify({results}, null, 2));
const analysisSnapshot = { repository: "perf/fixture", commitSha: "perfseed", files: Array.from({ length: 100 }, (_, i) => ({ path: `src/m${i}.ts`, blobSha: `b${i}`, contentHash: `h${i}`, content: `import x from "./m${(i + 1) % 100}"; export const s${i}=1;` })) };
const analysis = await time(() => analyzeRepository(analysisSnapshot), warmup, reps);
const viewerLoads: any[] = [];
const { chromium } = await import("../packages/cli/node_modules/@playwright/test/index.js");
const browser = await chromium.launch({ headless: true });
const dir = await mkdtemp(join(tmpdir(), "perf-html-"));
for (const row of results) {
  const ir = fixture(row.workload.nodes, row.workload.relationships);
  const html = createSelfContainedHtml(ir, layoutDiagram(ir));
  const file = join(dir, `${row.workload.name}.html`);
  await writeFile(file, html);
  const samples: number[] = [];
  for (let i = 0; i < warmup + 3; i++) {
    const page = await browser.newPage();
    const t = performance.now();
    await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
    await page.waitForSelector("svg");
    const elapsed = performance.now() - t;
    const errors = await page.evaluate(() => (window as any).__perfErrors ?? 0);
    await page.close();
    if (i >= warmup) samples.push(elapsed);
    if (i === 0) row.viewerConsoleProbe = errors;
  }
  row.operations.viewerLoad = stats(samples);
  viewerLoads.push(row.workload.name);
}
await browser.close();
const report = {
  implementationSha: "056a9eab3fd46ce73716dd7fb0c0ffbc5f748fc3",
  measuredTree: process.env.PERF_TREE ?? "working-tree",
  environment: { node: process.version, platform: platform(), release: release(), arch: arch(), cpu: cpus()[0]?.model, cores: cpus().length, memoryBytes: totalmem() },
  policy: { seed, warmup, repetitions: reps, layoutRepetitions: 3, viewerLoadRepetitions: 3, typical: "median", targets: { viewerLoadMs: 2000, searchMs: 100, focusMs: 100 } },
  analysis: { files: 100, ...analysis, findings: analyzeRepository(analysisSnapshot).findings.length },
  results
};
await writeFile("/tmp/perf-out/performance-qualification.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
