import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { root } from "../frames/exec.js";
import { type CpuProfile, type FoldedRow, foldProfile, topBy } from "./profile-fold.js";

/**
 * `bun run profile <file.ts>` — which functions a script spends its time in.
 *
 *   bun run profile scratch.ts              the top twenty by self and by total
 *   bun run profile scratch.ts --top 40     more rows
 *   bun run profile scratch.ts -- a b       arguments after `--` go to the script
 *
 * It runs the script under `bun --cpu-prof`, reads the profile back and prints
 * the functions by self time — the time spent in the function's own lines —
 * and by total time, with everything it called. The usual script calls one
 * render function a few thousand times on the stub canvas
 * (`packages/render/test/canvas-stub.ts`): that is how `rimAt` was found at
 * 86% of a FIZZ knob that cost 0.4 ms, and it took two scratch scripts before
 * this was a command (`docs/queue.md`, 14 October 2026). `bun test --cpu-prof`
 * writes no profile, so a test cannot be profiled directly; copy the loop out.
 *
 * The profile file is kept, and its path printed, for DevTools' Performance
 * panel when a flat list is not enough.
 */

const args = process.argv.slice(2);
const dash = args.indexOf("--");
const own = dash < 0 ? args : args.slice(0, dash);
const passed = dash < 0 ? [] : args.slice(dash + 1);
const topAt = own.indexOf("--top");
const top = topAt < 0 ? 20 : Number(own[topAt + 1]);
const script = own.find((a, i) => !a.startsWith("--") && i !== topAt + 1);

if (script === undefined || !Number.isInteger(top) || top < 1) {
  console.error("usage: bun run profile <file.ts> [--top N] [-- script args]");
  process.exit(2);
}

const dir = mkdtempSync(join(tmpdir(), "neon-profile-"));
const proc = Bun.spawnSync(
  ["bun", "--cpu-prof", `--cpu-prof-dir=${dir}`, resolve(script), ...passed],
  { stdout: "inherit", stderr: "inherit" },
);
if (proc.exitCode !== 0) {
  console.error(`profile: the script exited ${proc.exitCode}`);
  process.exit(proc.exitCode ?? 1);
}
const file = readdirSync(dir).find((f) => f.endsWith(".cpuprofile"));
if (file === undefined) {
  console.error(`profile: bun wrote no .cpuprofile into ${dir}`);
  process.exit(1);
}

const path = join(dir, file);
const folded = foldProfile(
  JSON.parse(readFileSync(path, "utf8")) as CpuProfile,
  root.replace(/\/$/, ""),
);
const ms = (us: number): string => (us / 1000).toFixed(1).padStart(9);
const pct = (us: number): string =>
  `${((100 * us) / Math.max(1, folded.sampledUs)).toFixed(1).padStart(5)}%`;
const table = (title: string, key: "selfUs" | "totalUs", rows: FoldedRow[]): void => {
  console.log(`\n${title}`);
  for (const r of rows) console.log(`${ms(r[key])} ms ${pct(r[key])}  ${r.name}`);
};

console.log(`\n${(folded.sampledUs / 1000).toFixed(1)} ms sampled — ${path}`);
table("by self time", "selfUs", topBy(folded.rows, "selfUs", top));
table("by total time", "totalUs", topBy(folded.rows, "totalUs", top));
