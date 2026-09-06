import { WAVES } from "@neon-spore/content";
import { closeBrowser, launchBrowser } from "../frames/browser.js";
import { git, root, startPreview } from "../frames/serve.js";
import { DEFAULT_THROTTLE, keyOf, mergeInto, type Run } from "./compare.js";
import { calibrate, sweep, waveId } from "./measure.js";
import { DRIFT_MIN_WAVES } from "./noise.js";
import { renumber } from "./renumber.js";
import { printComparison, printRun, printSummary } from "./say.js";
import { assemble } from "./shape.js";
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
 *   bun run perf --wave X --save      merge that one wave into the baseline
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

// **A narrow `--save` merges rather than replaces.** The baseline is the
// reference every later run is read against, and `tools/perf/test/compare.test.ts`
// refuses one that does not cover every wave the game ships — a wave with no row
// is a wave nothing can notice getting slower. So a narrow run may not *become*
// the baseline; what it may do is put its own rows into one, which is exactly
// what `baseline.test.ts` asks for by name when a wave's arrivals have changed.
// `mergeInto` carries why that is readable now and was not before.

async function readBaseline(): Promise<Run | null> {
  const file = Bun.file(BASELINE);
  return (await file.exists()) ? ((await file.json()) as Run) : null;
}

const preview = await startPreview(root);
const browser = await launchBrowser();

/**
 * A browser that goes away mid-run takes the page with it, and the throw comes
 * out of whichever helper was holding it — `clearOpening` reporting that the
 * target had been closed, which is true and names nothing a reader can act on.
 * Two sweeps in the same shell did exactly that, four waves in, and so did the
 * third; a session then spent a turn establishing that the measurement was not
 * at fault. So the run notices the disconnect itself and says the one thing
 * worth saying about it.
 */
let lost = false;
browser.on("disconnected", () => {
  lost = true;
});
/** Held rather than printed, because `process.exit` inside the `try` would skip
 * the `finally` and leave the preview server running. */
let vanished = false;

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

  if (save && !narrow) {
    await Bun.write(BASELINE, `${JSON.stringify(now, null, 2)}\n`);
    console.log(`\nbaseline written: tools/perf/baseline.json`);
  } else if (save) {
    const taken = asked.map((i) => i + 1);
    // Merging into nothing, or leaving the file short of the game afterwards,
    // would leave a baseline no comparison can be taken off. What the check
    // cannot be is "the baseline already covers every wave": a lane that adds
    // one is exactly the lane whose baseline does not, and refusing there sent
    // it to the full sweep this flag exists to spare. So the question is asked
    // about the file this run is about to *write* — every wave covered, by the
    // rows that are there plus the ones being merged in (`mergeInto`).
    // By id rather than by number, for the same reason the merge is: an
    // inserted wave moves every number after it, so a baseline's numbers are
    // yesterday's and counting today's against them says nothing.
    const covered = new Set([
      ...(before?.waves ?? []).map((w) => keyOf(w)),
      ...asked.map((i) => waveId(i)),
    ]);
    if (!before || covered.size !== WAVES.length) {
      console.log("✗ --wave --save would leave the baseline short of the game");
      console.log(
        `  ${WAVES.length} waves, ${covered.size} covered — take the sweep first: bun run perf --save`,
      );
      process.exit(1);
    }
    const merged = mergeInto(before, now, taken);
    if (!merged) {
      console.log("✗ this run shares no untouched wave with the baseline — nothing to scale it by");
      console.log(
        "  the reference waves are what a merged row is put on the baseline's footing with",
      );
      process.exit(1);
    }
    const { run: written, dropped } = renumber(merged);
    await Bun.write(BASELINE, `${JSON.stringify(written, null, 2)}\n`);
    const rows = written.waves.filter((w) => taken.includes(w.wave));
    const scale = rows[0]?.mergedFrom?.scale ?? 1;
    console.log(
      `\nbaseline merged: ${rows.map((w) => `${w.wave} ${w.name}`).join(", ")} — the other ` +
        `${written.waves.length - rows.length} rows are untouched`,
    );
    console.log(
      `  scaled by ${scale.toFixed(2)}x onto the baseline's footing, read off the reference waves ` +
        `neither run changed`,
    );
    if (dropped.length > 0) {
      console.log(`  dropped, no longer in the game: ${dropped.join(", ")}`);
    }
  } else if (before) {
    console.log(
      narrow
        ? `\na baseline is taken from a full sweep — or --save merges these waves into it.`
        : `\n--save writes this run back as the baseline.`,
    );
  }
} catch (error) {
  if (!lost) throw error;
  vanished = true;
} finally {
  await closeBrowser(browser);
  await preview.stop();
}

if (vanished) {
  console.log("✗ the browser closed part-way through the run — nothing was measured");
  console.log("  not the code under test. Run it again; the teardown now waits for the last one.");
  process.exit(1);
}
