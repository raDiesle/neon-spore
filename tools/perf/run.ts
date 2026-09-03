import { chromium } from "playwright-core";
import { findChrome } from "../frames/chrome.js";
import { git, root, startPreview } from "../frames/serve.js";
import {
  budgetPct,
  comparable,
  compareRuns,
  DEFAULT_THROTTLE,
  FRAME_MS,
  medianMs,
  NOISE_PCT,
  type Run,
  verdictFor,
  type WaveCost,
} from "./compare.js";
import { assemble, calibrate, sweep } from "./measure.js";

/**
 * `bun run perf` — what a frame costs, wave by wave, at phone speed.
 *
 * It exists because nothing else in this repository can answer that.
 * `packages/render/test/frame-budget.test.ts` counts canvas *operations*, which
 * is the right regression guard and is not a time; every claim about how this
 * game behaves on a phone used to be an op count or a guess.
 *
 * The measurement is Chrome's own: `Emulation.setCPUThrottlingRate`, the
 * mechanism behind DevTools' "mid-tier mobile" preset, over the real built
 * bundle a `bun run preview` serves. `docs/performance.md` carries the
 * mechanism in prose and the numbers this tool last agreed with.
 *
 *   bun run perf                 measure, and compare against the baseline
 *   bun run perf --throttle 6    at low-end-mobile speed instead
 *   bun run perf --save          write the result back as the new baseline
 */

const BASELINE = new URL("./baseline.json", import.meta.url);
const VIEWPORT = { width: 390, height: 844, dpr: 2 } as const;

function flag(name: string): string | undefined {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? undefined : process.argv[at + 1];
}
const save = process.argv.includes("--save");
const throttle = Number(flag("throttle") ?? DEFAULT_THROTTLE);

async function readBaseline(): Promise<Run | null> {
  const file = Bun.file(BASELINE);
  return (await file.exists()) ? ((await file.json()) as Run) : null;
}

function bar(ms: number, width = 28): string {
  const filled = Math.min(width, Math.round((ms / FRAME_MS) * width));
  return "#".repeat(filled).padEnd(width, ".");
}

function printRun(waves: WaveCost[]): void {
  console.log("");
  console.log(`  #  wave                  bodies     ms   p90   of a 60Hz frame`);
  for (const w of waves) {
    const mark = verdictFor(w.mean) === "fine" ? " " : verdictFor(w.mean) === "tight" ? "!" : "X";
    console.log(
      `${mark} ${String(w.wave).padStart(2)}  ${w.name.padEnd(20).slice(0, 20)}  ` +
        `${String(w.bodies).padStart(4)}  ${w.mean.toFixed(2).padStart(5)}  ` +
        `${w.p90.toFixed(1).padStart(4)}  ${bar(w.mean)} ${budgetPct(w.mean).toFixed(0).padStart(3)}%`,
    );
  }
}

/**
 * The only question this tool exists to answer twice: better or worse.
 *
 * The percentage is a wave's share of its own run's median, never its raw
 * milliseconds — `compare.ts` says why, and the short version is that a busy
 * machine moves every wave at once and only the share can tell that apart from
 * a change somebody made. The milliseconds are printed beside it because a
 * reader wants them, not because the verdict was taken on them.
 */
function printComparison(before: Run, after: Run): void {
  console.log("");
  console.log(`against the baseline of ${before.measuredAt} (${before.commit.slice(0, 7)}):`);

  const wasMedian = medianMs(before);
  const nowMedian = medianMs(after);
  const drift = wasMedian === 0 ? 0 : ((nowMedian - wasMedian) / wasMedian) * 100;
  if (!comparable(before, after)) {
    console.log(
      `  not the same measurement — baseline ${before.throttle}x on a machine scoring ` +
        `${before.calibration}, this run ${after.throttle}x scoring ${after.calibration}. ` +
        `The milliseconds below are for reading, not for comparing.`,
    );
  } else if (Math.abs(drift) > NOISE_PCT) {
    console.log(
      `  the whole run moved ${drift > 0 ? "+" : ""}${drift.toFixed(0)}% ` +
        `(median ${wasMedian.toFixed(2)} -> ${nowMedian.toFixed(2)} ms) — the machine was busier ` +
        `or quieter, not the game. The shares below already have that taken out.`,
    );
  }

  const deltas = compareRuns(before, after);
  const worse = deltas.filter((d) => d.verdict === "worse");
  const better = deltas.filter((d) => d.verdict === "better");
  const fresh = deltas.filter((d) => d.verdict === "new");
  for (const d of [...worse, ...fresh, ...better]) {
    const change =
      d.verdict === "new"
        ? `new — ${d.after.toFixed(2)} ms`
        : `${d.changePct > 0 ? "+" : ""}${d.changePct.toFixed(0)}% of the share it had ` +
          `(typical paint ${d.before.toFixed(2)} -> ${d.after.toFixed(2)} ms)`;
    console.log(
      `  ${d.verdict.toUpperCase().padEnd(7)} ${String(d.wave).padStart(2)} ${d.name.padEnd(20)} ${change}`,
    );
  }
  if (worse.length === 0 && fresh.length === 0) console.log("  nothing got dearer.");
}

const preview = await startPreview(root);
const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: VIEWPORT.width, height: VIEWPORT.height },
    deviceScaleFactor: VIEWPORT.dpr,
  });
  const cdp = await page.context().newCDPSession(page);
  await page.goto(`${preview.url}/?play=1`, { waitUntil: "load" });
  await page.waitForFunction(() => window.neonSpore !== undefined, null, { timeout: 30_000 });

  // Unthrottled: a slowed CPU would measure the calibration loop itself rather
  // than the machine it is standing in for.
  const calibration = await calibrate(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });

  console.log(
    `measuring ${VIEWPORT.width}x${VIEWPORT.height} dpr${VIEWPORT.dpr}, CPU throttled ${throttle}x, ` +
      `machine ${calibration}`,
  );
  const waves = await sweep(page, (w) => process.stdout.write(`  ${w.wave} ${w.name}\r`));
  const commit = await git(["rev-parse", "HEAD"]);
  const now = assemble({ commit, throttle, viewport: VIEWPORT, calibration, waves });

  printRun(waves);
  const worst = [...waves].sort((a, b) => b.p90 - a.p90)[0] as WaveCost;
  console.log("");
  console.log(
    `median ${medianMs(now).toFixed(2)} ms; worst ${worst.name} at ${worst.p90.toFixed(1)} ms ` +
      `(${budgetPct(worst.p90).toFixed(0)}% of a 60Hz frame)`,
  );

  const before = await readBaseline();
  if (before) printComparison(before, now);

  if (save) {
    await Bun.write(BASELINE, `${JSON.stringify(now, null, 2)}\n`);
    console.log(`\nbaseline written: tools/perf/baseline.json`);
  } else if (before) {
    console.log(`\n--save writes this run back as the baseline.`);
  }
} finally {
  await browser.close();
  await preview.stop();
}
