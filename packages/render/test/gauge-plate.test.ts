import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { KEY } from "@neon-spore/content";
import type { GaugeState } from "@neon-spore/sim";
import { type Dial, gaugeBandMid, gaugeNeedleTip } from "../src/gauge.js";
import { BEZEL, drawGaugeBezel, drawGaugeGlass, drawGaugeHub } from "../src/gauge-dial-face.js";
import { drawGaugePlate, PLATE_PAD } from "../src/gauge-plate.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GAUGE as a made thing (`gauge-plate.ts`, `gauge-dial-face.ts`), held to
 * the two things that would make it wrong.
 *
 * **It moves no number of the dial.** The plate is outside the bezel, the
 * bezel is outside the rim, the glass is inside it and the boss is smaller
 * than the needle it mounts — so the reading a pair call a round on is drawn
 * exactly where `gauge.ts` puts it, and nothing new stands on it. A look that
 * moved the rim would move where the band is judged, which is not a look.
 *
 * **It is lit once.** Every sheen, every shoulder, every bolt head and the
 * film on the glass sit on the same side, `KEY` (`content/light.ts`). That is
 * what makes a dozen separate marks read as one object rather than a dozen,
 * and it is the only thing about this picture a test can hold.
 */

beforeAll(installCanvasGlobals);

const DIAL: Dial = { cx: 200, cy: 400, r: 160 };
/** The band's inner edge and the notches' inner reach, both `gauge.ts`'s. */
const BAND_INNER = 0.62;
const NOTCH_INNER = 0.86;

type Arc = { x: number; y: number; r: number };
type Line = { x0: number; y0: number; x1: number; y1: number };

/** Every arc, linear gradient and radial gradient a draw puts on the canvas. */
function record(draw: (ctx: CanvasRenderingContext2D) => void) {
  const { ctx } = stubCanvas();
  const arcs: Arc[] = [];
  const linear: Line[] = [];
  const radial: Arc[] = [];
  const spy = new Proxy(ctx, {
    get(target, prop, receiver) {
      if (prop === "arc") {
        return (x: number, y: number, r: number, ...rest: number[]) => {
          arcs.push({ x, y, r });
          return (target.arc as (...a: number[]) => void)(x, y, r, ...rest);
        };
      }
      if (prop === "createLinearGradient") {
        return (x0: number, y0: number, x1: number, y1: number) => {
          linear.push({ x0, y0, x1, y1 });
          return (target.createLinearGradient as (...a: number[]) => unknown)(x0, y0, x1, y1);
        };
      }
      if (prop === "createRadialGradient") {
        return (x: number, y: number, r: number, ...rest: number[]) => {
          radial.push({ x, y, r });
          return (target.createRadialGradient as (...a: number[]) => unknown)(x, y, r, ...rest);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  }) as unknown as CanvasRenderingContext2D;
  draw(spy);
  return { arcs, linear, radial };
}

/** Arcs struck about the dial's own middle, which is every arc but a bolt's. */
const aboutTheMiddle = (arcs: readonly Arc[]) =>
  arcs.filter((a) => Math.hypot(a.x - DIAL.cx, a.y - DIAL.cy) < 1e-6);

/** That a mark sits on the key's side of whatever it is a highlight on. */
function alongTheKey(dx: number, dy: number): void {
  expect(dx * KEY.x + dy * KEY.y).toBeGreaterThan(0);
  expect(Math.abs(dx * KEY.y - dy * KEY.x)).toBeLessThan(1e-6);
}

/** A bolt is two arcs: a dark head, then its highlight at 0.55 of the head. */
function bolts(arcs: readonly Arc[]): { head: Arc; lit: Arc }[] {
  const out: { head: Arc; lit: Arc }[] = [];
  for (let i = 1; i < arcs.length; i++) {
    const head = arcs[i - 1];
    const lit = arcs[i];
    if (head === undefined || lit === undefined) continue;
    if (Math.abs(lit.r - head.r * 0.55) < 1e-9) out.push({ head, lit });
  }
  return out;
}

describe("THE GAUGE's plate", () => {
  it("keeps the bezel on the plate rather than hanging off it", () => {
    expect(PLATE_PAD).toBeGreaterThan(BEZEL);
  });

  it("stands the bezel outside the rim and sinks the glass inside it", () => {
    const bezel = aboutTheMiddle(record((ctx) => drawGaugeBezel(ctx, DIAL)).arcs);
    expect(bezel.length).toBeGreaterThan(0);
    for (const a of bezel) expect(a.r).toBeGreaterThanOrEqual(DIAL.r);
    expect(Math.max(...bezel.map((a) => a.r))).toBeCloseTo(DIAL.r * (1 + BEZEL), 6);

    const glass = aboutTheMiddle(record((ctx) => drawGaugeGlass(ctx, DIAL)).arcs);
    expect(glass.length).toBeGreaterThan(0);
    for (const a of glass) expect(a.r).toBeLessThanOrEqual(DIAL.r);
  });

  it("keeps the boss clear of everything the round is read off", () => {
    const hub = aboutTheMiddle(record((ctx) => drawGaugeHub(ctx, DIAL)).arcs);
    expect(hub.length).toBeGreaterThan(0);
    // Inside the band's inner edge and the shortest notch, so the two things a
    // call is made of are never under it.
    for (const a of hub) expect(a.r).toBeLessThan(DIAL.r * BAND_INNER);
    const g = { needleMilli: 500, markMilli: 500 } as GaugeState;
    const reach = Math.max(...hub.map((a) => a.r));
    const tip = gaugeNeedleTip(DIAL, g);
    const mid = gaugeBandMid(DIAL, g);
    expect(Math.hypot(tip.x - DIAL.cx, tip.y - DIAL.cy)).toBeGreaterThan(reach);
    expect(Math.hypot(mid.x - DIAL.cx, mid.y - DIAL.cy)).toBeGreaterThan(reach);
    expect(Math.hypot(mid.x - DIAL.cx, mid.y - DIAL.cy)).toBeLessThan(DIAL.r * NOTCH_INNER);
  });

  it("lights the plate, the bezel and the glass from the one key", () => {
    for (const draw of [drawGaugePlate, drawGaugeBezel]) {
      const [g] = record((ctx) => draw(ctx, DIAL)).linear;
      if (g === undefined) throw new Error("no sheen on a face that is supposed to be lit");
      // The stop at 0 is the lit end, so the gradient runs away from the key.
      alongTheKey(g.x0 - g.x1, g.y0 - g.y1);
    }
    const [film] = record((ctx) => drawGaugeGlass(ctx, DIAL)).radial;
    if (film === undefined) throw new Error("no film on the glass");
    alongTheKey(film.x - DIAL.cx, film.y - DIAL.cy);
  });

  it("puts every bolt's highlight on the same shoulder", () => {
    const plate = bolts(record((ctx) => drawGaugePlate(ctx, DIAL)).arcs);
    const bezel = bolts(record((ctx) => drawGaugeBezel(ctx, DIAL)).arcs);
    expect(plate.length).toBe(2);
    expect(bezel.length).toBe(9);
    for (const { head, lit } of [...plate, ...bezel]) alongTheKey(lit.x - head.x, lit.y - head.y);
  });
});
