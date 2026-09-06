import { WAVES } from "@neon-spore/content";
import { chromium } from "playwright-core";
import { findChrome } from "../frames/chrome.js";
import { git, root, startPreview } from "../frames/serve.js";
import { DEFAULT_THROTTLE, DRIFT_MIN_WAVES, type Run } from "./compare.js";
import { assemble, calibrate, sweep } from "./measure.js";
import { printComparison, printRun, printSummary } from "./say.js";
import { wavesAsked, withReferences } from "./waves.js";

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
 *   bun run perf --wave "THE FENCE"   the waves a change touched, and nothing else
 *   bun run perf                      every wave — what a baseline is taken from
 *   bun run perf --throttle 6         at low-end-mobile speed instead
 *   bun run perf --save               write a full sweep back as the new baseline
 *
 * **The narrow run is the ordinary one.** A lane that adds a creature measures
 * the waves that creature appears in; the whole game is swept when a baseline is
 * being taken, which is not something a change to one shape needs. `--wave`
 * takes the number the HUD prints or the name it prints beside it, repeated or
 * comma-separated.
 */

const BASELINE = new URL("./baseline.json", import.meta.url);
const VIEWPORT = { width: 390, height: 844, dpr: 2 } as const;

function flag(name: string): string | undefined {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? undefined : process.argv[at + 1];
}

/** Every `--wave` on the line, split on commas, in the order they were given. */
function flags(name: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] !== `--${name}`) continue;
    const value = process.argv[i + 1];
    if (value !== undefined) out.push(...value.split(","));
  }
  return out;
}
const save = process.argv.includes("--save");
const throttle = Number(flag("throttle") ?? DEFAULT_THROTTLE);
// A mistyped wave is refused the way every other bad input here is, rather than
// as a stack trace: the name is something a person typed off the HUD.
let asked: number[];
let only: number[];
let references: number[];
try {
  asked = wavesAsked(flags("wave"));
  // A narrow run carries the reference waves so its median is made of code the
  // lane did not touch (`waves.ts`). Without them the verdict has to be
  // withheld, and the verdict is the reason anybody runs this.
  only = withReferences(asked, DRIFT_MIN_WAVES);
  references = only.filter((i) => !asked.includes(i));
} catch (error) {
  console.log(`✗ ${(error as Error).message}`);
  process.exit(1);
}
const narrow = only.length < WAVES.length;
/** The wave numbers the reference set contributed, for marking them in the print. */
const carried = new Set(references.map((i) => i + 1));

// **A narrow run may not become the baseline.** The baseline is the reference
// every later run is read against and `tools/perf/test/compare.test.ts` refuses
// one that does not cover every wave the game ships — a wave with no row is a
// wave nothing can notice getting slower. Merging a few waves into it would be
// worse than refusing: the shares `compare.ts` reads are each wave against its
// own run's median, so a baseline stitched out of two afternoons compares
// nothing to nothing.
if (save && narrow) {
  console.log("✗ --save takes a full sweep; drop --wave, or drop --save");
  console.log("  a baseline missing a wave is a wave nothing can notice getting slower");
  process.exit(1);
}

async function readBaseline(): Promise<Run | null> {
  const file = Bun.file(BASELINE);
  return (await file.exists()) ? ((await file.json()) as Run) : null;
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
  if (references.length > 0) {
    console.log(
      `  ${asked.length} asked for, and ${references.length} reference waves carried along so the ` +
        `run has a median of its own — marked · below (tools/perf/waves.ts)`,
    );
  }
  const waves = await sweep(page, (w) => process.stdout.write(`  ${w.wave} ${w.name}\r`), only);
  const commit = await git(["rev-parse", "HEAD"]);
  const now = assemble({ commit, throttle, viewport: VIEWPORT, calibration, waves });

  printRun(waves, carried);
  printSummary(now);

  const before = await readBaseline();
  if (before) printComparison(before, now, carried);

  if (save) {
    await Bun.write(BASELINE, `${JSON.stringify(now, null, 2)}\n`);
    console.log(`\nbaseline written: tools/perf/baseline.json`);
  } else if (before) {
    console.log(
      narrow
        ? `\na baseline is taken from a full sweep — drop --wave, then --save.`
        : `\n--save writes this run back as the baseline.`,
    );
  }
} finally {
  await browser.close();
  await preview.stop();
}
