import type { Run } from "./compare.js";
import { fillUnmeasured } from "./unmeasured.js";

/**
 * `bun run baseline:blank` — bring `tools/perf/baseline.json` up to the waves
 * the game ships today, opening no browser and measuring nothing.
 *
 * **Why this is its own command rather than a flag on `perf`.** It was
 * `bun run perf --unmeasured` until 14 September 2026, and the name was the
 * whole problem. The owner's rule is that a cloud session never runs
 * `bun run perf`, in any form — a measuring run is killed on a cloud runner at
 * 400 and 580 seconds and returns a number about the runner rather than about
 * the game (`docs/performance.md`). This operation is none of that: it is a
 * pure function over a JSON file (`unmeasured.ts`'s `fillUnmeasured`), it
 * launches nothing and it takes no reading. Reaching it only through a command
 * spelled `perf` meant a session that changed a wave had a failing check and no
 * command it was allowed to type — which is the queue item this closes.
 *
 * So the rule stays exactly as strict as it was and gets easier to keep: a
 * cloud session never types `perf`, and the one thing it legitimately needed
 * from that command now has a name that says what it does.
 *
 * **What it cannot do is hide a real number.** `fillUnmeasured` blanks a row
 * only when the wave no longer sends what that row was measured on, which
 * means the figures already describe a wave that does not exist. There is no
 * argument that makes it discard a measurement still worth having, so it is
 * safe to run without judgement — unlike `--save`, which is why that one stays
 * on `perf` behind the browser.
 */

const BASELINE = new URL("./baseline.json", import.meta.url);

const file = Bun.file(BASELINE);
if (!(await file.exists())) {
  console.log(
    "✗ there is no baseline to bring up to date — take the sweep first: bun run perf --save",
  );
  process.exit(1);
}

const before = (await file.json()) as Run;
const { run: written, added, blanked, moved, dropped } = fillUnmeasured(before);
// Written whenever *anything* differs, not only when a row was added or
// blanked: a rebase that left an inserted wave's row at yesterday's number,
// with every row behind it one out, used to be answered with "nothing to
// mark" and a failing `baseline.test.ts` (`docs/queue.md`, 17 September 2026).
if (JSON.stringify(written) === JSON.stringify(before)) {
  console.log("the baseline already describes the waves the game ships — nothing to mark");
  process.exit(0);
}

await Bun.write(
  BASELINE,
  `${JSON.stringify(written, null, 2)}
`,
);
const marked = [...added, ...blanked.map((b) => `${b} (changed under its row)`)];
if (marked.length > 0) {
  console.log(`marked unmeasured in tools/perf/baseline.json: ${marked.join(", ")}`);
  console.log("  commit it, and say in the report that those waves went in unweighed");
}
if (moved.length > 0) console.log(`renumbered to today's play order: ${moved.join(", ")}`);
if (dropped.length > 0) console.log(`dropped, the game no longer has them: ${dropped.join(", ")}`);
if (marked.length + moved.length + dropped.length === 0) {
  console.log("put tools/perf/baseline.json back in play order — the rows were out of sequence");
}
