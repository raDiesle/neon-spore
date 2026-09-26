/**
 * A canvas that answers like the real one and complains where the real one
 * would — or, in a few places, where the real one silently would not.
 *
 * A frame's output is pixels, and pixels are not assertable. Its *arguments*
 * are: a colour the browser cannot parse, a coordinate that came out NaN, a
 * negative radius. Every one of those is a crash or an invisible object in
 * the running game and nothing at all in a type check. So the stub is strict,
 * and a frame drawn through it either passes or names the call that was
 * wrong.
 *
 * Bun has no DOM, so this also installs the two globals render/ reaches for:
 * `document.createElement("canvas")` (glow sprites, the dither tile) and
 * `Path2D`.
 *
 * The context is a chain of three, one file each: `canvas-stub-state.ts`
 * (styles, tally, log, transform), `canvas-stub-text.ts` (where words land),
 * and the draw calls here. The checks every argument goes through, and the
 * path, are `canvas-stub-check.ts`.
 */

import { cpuTimeout } from "../../../tools/test/cpu-time.js";
import { clearBakedCaches } from "../src/baked.js";
import {
  fail,
  nums,
  radii,
  StubGradient,
  StubImageData,
  StubPath,
  StubPattern,
  setActiveLog,
  setActiveTally,
} from "./canvas-stub-check.js";
import { StubText } from "./canvas-stub-text.js";

export type { TextBox } from "./canvas-stub-text.js";

/**
 * The cap a test that draws through this canvas runs under.
 *
 * **Each file calls `setDefaultTimeout(FRAME_TIMEOUT_MS)` for itself**, and the
 * number lives here — beside the thing that makes those tests slow — so there
 * is still only one of it. It sat in `frame-harness.ts`, which also *called*
 * it at the top of the module, and that call was never true of more than one
 * file at a time: bun applies it to the file it is in, and a module is
 * evaluated once, by whichever test imports it first. Everything after that
 * one was quietly on bun's five-second default. It surfaced twice — as
 * `crawler-frame.test.ts` failing at 5017 ms inside a check it passes in 4.4 s
 * alone (7 September 2026), and again on 17 September when three consecutive
 * runs of one green diff failed three *different* tests across two files that
 * had never made the call. The side effect is gone; every file makes the call.
 *
 * It is deliberately far above what any of these files take, because it is not
 * a budget — `frame-budget.test.ts` is the budget, and an op is not a
 * millisecond. This one only says "a busy machine is not a failure".
 *
 * **And a flat number cannot say that.** It was thirty seconds until 17
 * September 2026, when `briefing.test.ts` went red at *draws a rehearsal,
 * through every page of it* under a `check:fast` whose eight shards took 237
 * seconds against 96 on the green rerun a minute later: a second session had
 * fourteen shards of its own up, the load average was 50, and a case that
 * costs 2.4 s alone did not finish in thirty. Thirty is right for one machine
 * under one load and for no other.
 *
 * So the machine says instead. `cpuTimeout` takes what the heaviest case here
 * costs on a quiet machine — 2.4 s for that rehearsal, rounded to three — and
 * allows three times that, times how much slower this machine is *computing*
 * than a quiet one (`tools/test/cpu-time.ts`).
 *
 * **Computing, and not forking.** The first cut of this scaled off
 * `repo-time.ts`, whose baseline is `git init --bare`, and that reads a quiet
 * mac as ten times loaded because macOS spawns slowly — which pinned this cap
 * at the three-minute ceiling on the machine it was written on, where it says
 * nothing at all. A frame drawn through this canvas spawns nothing, so the
 * unit is runnable work per core and the lot of it is in `cpu-time.ts`.
 */
export const FRAME_TIMEOUT_MS: number = cpuTimeout(3_000);

/** The context a frame draws through: the path and draw calls, on top of the
 * state and the text recording it inherits. */
export class StubContext extends StubText {
  beginPath(): void {
    this.mark("beginPath");
  }
  closePath(): void {}
  clip(): void {
    this.mark("clip");
  }
  moveTo(...a: number[]): void {
    nums("moveTo", a);
  }
  lineTo(...a: number[]): void {
    nums("lineTo", a);
  }
  quadraticCurveTo(...a: number[]): void {
    nums("quadraticCurveTo", a);
  }
  /** The cubic. THE WISP's streamers are the first thing here to want one:
   * a tentacle has a root that hangs and a tip that trails, which is two
   * controls and not one (`render/wisp-body.ts`). */
  bezierCurveTo(...a: number[]): void {
    nums("bezierCurveTo", a);
  }
  rect(...a: number[]): void {
    nums("rect", a);
  }
  /** A real canvas throws `IndexSizeError` on a negative corner radius, and
   * takes NaN nowhere — so this refuses both, like every other path call here. */
  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void {
    nums("arcTo", [x1, y1, x2, y2, r]);
    if (r < 0) fail("arcTo", `radius ${r} is negative`);
  }
  /** One radius, or up to four — `radii` is where the corner list is held to
   * what a real canvas takes. */
  roundRect(x: number, y: number, w: number, h: number, r: number | number[]): void {
    nums("roundRect", [x, y, w, h]);
    radii("roundRect", r);
  }

  arc(x: number, y: number, r: number, from: number, to: number): void {
    nums("arc", [x, y, r, from, to]);
    if (r < 0) fail("arc", `radius ${r} is negative`);
    this.calls++;
    this.mark("arc", undefined, [x, y, r, from, to]);
  }
  ellipse(
    x: number,
    y: number,
    rx: number,
    ry: number,
    rotation: number,
    from: number,
    to: number,
  ): void {
    nums("ellipse", [x, y, rx, ry, rotation, from, to]);
    if (rx < 0 || ry < 0) fail("ellipse", `radius ${rx < 0 ? rx : ry} is negative`);
    this.calls++;
    // Marked like `arc` above, which it is with a second radius. It was
    // counted and not recorded until 17 September 2026, so a picture made of
    // ellipses read as an empty log and a test that asked where it drew got
    // nothing back (`hull-splash.test.ts`).
    this.mark("ellipse", undefined, [x, y, rx, ry, rotation, from, to]);
  }
  /** The one call that must not be scaled by the transform on the context —
   * `render/surface-clear.ts` says why, and `surface-clear.test.ts` reads the
   * log this leaves to check that it was not. */
  clearRect(...a: number[]): void {
    nums("clearRect", a);
    this.calls++;
    this.mark("clearRect", undefined, a);
  }
  fillRect(...a: number[]): void {
    nums("fillRect", a);
    this.calls++;
    this.mark("fillRect", undefined, a);
  }
  strokeRect(...a: number[]): void {
    nums("strokeRect", a);
    this.calls++;
  }
  fill(): void {
    this.calls++;
    this.mark("fill");
  }
  stroke(): void {
    this.calls++;
    this.mark("stroke");
  }
  drawImage(_img: unknown, ...a: number[]): void {
    nums("drawImage", a);
    this.calls++;
    this.mark("drawImage", undefined, a);
  }

  createLinearGradient(...a: number[]): StubGradient {
    nums("createLinearGradient", a);
    this.mark("createLinearGradient", undefined, a);
    return new StubGradient();
  }
  createRadialGradient(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number,
  ): StubGradient {
    nums("createRadialGradient", [x0, y0, r0, x1, y1, r1]);
    this.mark("createRadialGradient", undefined, [x0, y0, r0, x1, y1, r1]);
    if (r0 < 0 || r1 < 0) fail("createRadialGradient", "radius is negative");
    return new StubGradient();
  }
  createPattern(): StubPattern {
    return new StubPattern();
  }
  createImageData(w: number, h: number): StubImageData {
    return new StubImageData(w, h);
  }
  putImageData(): void {}
}

/**
 * A canvas element, enough of one for `new Canvas2DRenderer(canvas)`.
 *
 * `primary` (default `true`) is what makes `new Path2D(...)` — which has no
 * `this: StubContext` of its own to tally against — count against *this*
 * context's `tally`/`log` rather than whatever offscreen sprite canvas a
 * pass happened to bake last. Every caller in a test file wants the default;
 * `installCanvasGlobals`'s own `document.createElement` is the one caller
 * that has to say `false`, since it is standing in for exactly the kind of
 * throwaway canvas a primary frame should not be attributed to.
 */
export function stubCanvas(primary = true): { canvas: HTMLCanvasElement; ctx: StubContext } {
  const ctx = new StubContext();
  if (primary) {
    setActiveTally(ctx.tally);
    // And the log with it, which a fresh context does not have. Left pointing
    // at an earlier test's array, every path coordinate of every later frame
    // in the process was appended to it: `surface-clear.test.ts` sharing a
    // shard with `briefing.test.ts` grew one process past 50 GB on 23
    // September 2026 and took the machine down.
    setActiveLog(undefined);
  }
  const canvas = {
    width: 0,
    height: 0,
    style: {},
    getContext: () => ctx,
  };
  ctx.canvas = canvas as unknown as HTMLCanvasElement;
  return { canvas: canvas as unknown as HTMLCanvasElement, ctx };
}

/**
 * Installs `document` and `Path2D`, which Bun does not have, and empties every
 * cache render bakes sprites into.
 *
 * The caches are module state and outlive a test, so whichever run first asked
 * for a size paid for the bake and every run after it got it free — a frame
 * budget's first row then carried whichever run happened to go first
 * (`src/baked.ts`). Emptying them here is also the only thing that stops a
 * sprite baked on one test's stub canvas being blitted onto the next one's.
 */
export function installCanvasGlobals(): void {
  clearBakedCaches();
  const g = globalThis as Record<string, unknown>;
  g.Path2D = StubPath;
  g.document = {
    createElement: (tag: string) => {
      if (tag !== "canvas") throw new Error(`unexpected createElement(${tag})`);
      return stubCanvas(false).canvas;
    },
  };
}
