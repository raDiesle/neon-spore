import { FRAME_MS } from "../../../tools/perf/sweep-timing.js";
import {
  type PerfHandle,
  type PhoneCost,
  perfRequested,
  sweepInPage,
  WAVE_COUNT,
} from "./perf-sweep.js";

/**
 * The readout `?perf=1` puts on the screen.
 *
 * A phone has no console anybody can read, so the sweep's table is drawn as a
 * page over the game — plain text, monospaced, and with the one figure that
 * matters big enough to photograph. That is the whole interface: the owner
 * opens the flag on the device, waits, and takes a picture of the screen.
 *
 * **No throttle, and that is the point.** `bun run perf` slows a desktop CPU
 * fourfold to stand in for a phone; here there is nothing to stand in for, so
 * the run records none and the header says so. A phone run is compared against
 * other phone runs, never against a throttled desktop one
 * (`docs/performance.md`).
 *
 * The rows also go to `console.log` as JSON, for the case where a cable *is*
 * attached and somebody wants the numbers rather than a photograph.
 */

const STYLE = [
  "position:fixed",
  "inset:0",
  "z-index:9999",
  "overflow:auto",
  "margin:0",
  "padding:12px",
  "background:#05040c",
  "color:#cfe6ff",
  "font:12px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace",
  "white-space:pre",
].join(";");

/** Milliseconds, right-aligned in a fixed column so the table reads as one. */
function ms(v: number, width = 6): string {
  return v.toFixed(2).padStart(width);
}

/** The middle of the run — the figure a photograph is taken for. */
export function medianOf(rows: readonly PhoneCost[]): number {
  if (rows.length === 0) return 0;
  const sorted = rows.map((r) => r.typical).sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] as number;
}

/** The whole readout as text — pure, so its shape can be tested off a phone. */
export function readout(rows: readonly PhoneCost[], total: number, device: string): string {
  const median = medianOf(rows);
  const worst = rows.reduce((a, b) => (b.typical > a.typical ? b : a), rows[0] as PhoneCost);
  const head = [
    `NEON SPORE — this device, no throttle`,
    device,
    "",
    rows.length < total ? `measuring ${rows.length} of ${total}…` : `${total} waves`,
    `median  ${median.toFixed(2)} ms per paint`,
    worst ? `worst   ${worst.name} at ${worst.p90.toFixed(2)} ms` : "",
    `a 60 Hz frame is ${FRAME_MS} ms`,
    "",
    "  #  wave                bodies  typical     p90",
  ];
  const body = rows.map(
    (r) =>
      `${String(r.wave).padStart(3)}  ${r.name.padEnd(20).slice(0, 20)}${String(r.bodies).padStart(4)}  ${ms(r.typical)}  ${ms(r.p90)}`,
  );
  return [...head, ...body].join("\n");
}

/** What the run was taken on, in one line — the phone's own description. */
function describeDevice(): string {
  const dpr = window.devicePixelRatio;
  return `${window.innerWidth}x${window.innerHeight} dpr ${dpr} · ${navigator.userAgent}`;
}

/**
 * Runs the sweep if `?perf=1` is set, drawing the table as it goes. Returns
 * what it did, so a caller that wants to say so can and a test can read the
 * decision without a browser.
 */
export async function runPerfPage(
  href: string,
  handle: PerfHandle,
): Promise<"off" | readonly PhoneCost[]> {
  if (!perfRequested(href)) return "off";
  const total = WAVE_COUNT;
  const device = describeDevice();
  const page = document.createElement("div");
  page.id = "perf";
  page.setAttribute("style", STYLE);
  page.textContent = readout([], total, device);
  document.body.append(page);

  const rows: PhoneCost[] = [];
  const done = await sweepInPage(handle, (cost) => {
    rows.push(cost);
    page.textContent = readout(rows, total, device);
  });
  page.textContent = readout(done, total, device);
  console.log(JSON.stringify({ throttle: null, device, waves: done }));
  return done;
}
