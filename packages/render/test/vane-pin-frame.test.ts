import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type VaneState,
  vaneTipCol,
  type World,
} from "@neon-spore/sim";
import { BossHurt } from "../src/boss-hurt.js";
import { computeLayout, tileCX } from "../src/layout.js";
import { drawVane } from "../src/vane-draw.js";

/**
 * The one thing `docs/queue.md` named: from VEER on, a pinned arm has to be
 * drawn where the pilot's thumb left it, not where the cycle has since swept
 * on to (`docs/spec/bosses.md` §11.5). `sim/test/vane-hand.test.ts` already
 * proves `vaneTipNow` freezes the column; this proves `drawVane` reads it
 * rather than the cycle's own `vaneTipCol`, by parsing the tip circle's own
 * path out of a canvas that just remembers what it was given.
 *
 * A local `Path2D`, not `canvas-stub.ts`'s: the stub tallies calls but never
 * keeps the `d` string a circle was built from, and that string is the only
 * place the drawn column survives to be read back.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const layout = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");

class RecordedPath {
  constructor(public d?: string) {}
  moveTo(): void {}
  lineTo(): void {}
  bezierCurveTo(): void {}
  quadraticCurveTo(): void {}
  arc(): void {}
  rect(): void {}
  roundRect(): void {}
  ellipse(): void {}
  closePath(): void {}
  addPath(): void {}
}

let hadPath2D: unknown;
beforeAll(() => {
  hadPath2D = (globalThis as { Path2D?: unknown }).Path2D;
  (globalThis as { Path2D?: unknown }).Path2D = RecordedPath;
});
afterAll(() => {
  (globalThis as { Path2D?: unknown }).Path2D = hadPath2D;
});

/** The `d` of the last circle `drawVane` filled — the tip, drawn after the
 * bearing's own hub, and the only other filled shape in the whole picture. */
function tipPathOf(world: World, b: VaneState): string {
  let last: string | undefined;
  const ctx = {
    save() {},
    restore() {},
    translate() {},
    fill(p: RecordedPath) {
      last = p.d;
    },
    stroke() {},
    beginPath() {},
    arc() {},
    // The mechanism is cut from metal and lit by a ramp down the beam
    // (`vane-bearing.ts`), so the picture now asks for gradients it did not
    // ask for when it was a line and two circles. A stop the fill never reads
    // back: what this file is after is one `d` string, and the fill style the
    // tip is painted in is nothing to do with the column it stands in.
    createLinearGradient() {
      return { addColorStop() {} };
    },
    set fillStyle(_v: unknown) {},
    set strokeStyle(_v: unknown) {},
    set lineWidth(_v: unknown) {},
    set lineCap(_v: unknown) {},
    set globalAlpha(_v: unknown) {},
    set globalCompositeOperation(_v: unknown) {},
    get globalCompositeOperation(): string {
      return "source-over";
    },
  };
  // `beatPhase = 0` so the drawn column is exactly `vaneTipNow`'s answer, with
  // no interpolation towards the next beat's to read past.
  drawVane(ctx as unknown as CanvasRenderingContext2D, layout, world, b, 0, 0, new BossHurt());
  if (last === undefined) throw new Error("drawVane filled nothing");
  return last;
}

/** The x a `circleSubpath(cx, ...)` was built with, read back off its own
 * `M (cx - r) cy` opening move. */
function circleX(d: string): number {
  const m = /^M (-?[\d.]+) /.exec(d);
  if (!m?.[1]) throw new Error(`not a circleSubpath: ${d}`);
  return Number(m[1]) + layout.tile * 0.11;
}

function open(pins: number): World {
  const world = createWorld({ ...CFG }, 1);
  startWave(world, 0, [], [], { kind: "vane", pins });
  return world;
}

function beats(world: World, n: number, inputs: TimedCommand[] = []): World {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  for (let t = 0; t < n * TPB; t++) step(world, byTick.get(world.tick) ?? []);
  return world;
}

const vane = (world: World): VaneState => {
  const b = world.boss;
  if (b === null || b.kind !== "vane") throw new Error("no vane");
  return b;
};

describe("a pinned arm, drawn", () => {
  it("stands where the thumb left it, not where the cycle has since swept on to", () => {
    const world = beats(open(3), 1);
    const at = world.tick;
    beats(world, 1, [
      { tick: at, player: 1, command: { kind: "drag", target: "vaneArm", on: true, fromMilli: 0 } },
    ]);
    const b = vane(world);
    const held = b.pinCol;
    // Two beats on, exactly as `sim/test/vane-hand.test.ts` proves: the cycle
    // has moved and the pin has not.
    beats(world, 2);
    const swept = vaneTipCol(CFG, b.pins, world.waveBeat);
    expect(swept).not.toBe(held);

    const x = circleX(tipPathOf(world, b));
    expect(x).toBeCloseTo(tileCX(layout, held), 1);
    expect(x).not.toBeCloseTo(tileCX(layout, swept), 1);
  });
});
