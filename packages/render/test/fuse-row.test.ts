import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SpawnEntry,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { GUIDE_LOOK } from "../src/guide-look.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { drawMineFuses } from "../src/mine.js";
import { sirenCentre, sirenFoot } from "../src/siren.js";
import { DIAL_R } from "../src/siren-dial.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

const CFG = DEFAULT_CONFIG;
const PHONE = { width: 390, height: 844, dpr: 1 };
/** The seat a mine drawn to player 2 leaves blind, which is the seat that gets
 * the ring instead of the body (`mine.ts`). */
const SEAT: ViewRole = "p1";

beforeAll(installCanvasGlobals);

/**
 * THE MINE's count, which is the bottom row of the ship's top chrome and was
 * not in that stack at all.
 *
 * `drawMineFuses` placed its ring at `gridTop + r * 1.3` — a measurement off
 * the top of the *field*, which is the one arrangement `ship-top-rows.ts` says
 * does not work: nothing up there writes its own number. On a tall phone the
 * field begins a long way down and the two never met, which is why it stood.
 * On any screen short enough that the field is limited by its height rather
 * than its width — a laptop window under about 730 tall, a rehearsal's pane —
 * `gridTop` is the radar's own height and the ring lands on the dial. A mine is
 * a `TALKER` kind (`comms.ts`), so that dial is lit for as long as one stands:
 * the pips read as a dashed rim around its red disc, and the count the blind
 * seat has to spend was not a thing on the screen. Measured before the fix at
 * 53 against a dial at 39 with a radius of 15.
 *
 * The ring is read off the pips it actually drew rather than asked of the
 * function that places it, because that function is what was wrong: the pips
 * are spaced evenly around the ring, so their mean is its middle.
 *
 * `alarm-room.test.ts` is the same stack from the other end — the two calls
 * that hang under the dial, and a rehearsal's plate over all of it.
 */
describe("the blind seat's fuse count", () => {
  /** One mine, drawn to player 2 — so `SEAT` above is the seat that gets the
   * ring instead of the body, and the siren is lit because a mine stands. */
  const MINE: SpawnEntry[] = [{ beat: 0, col: 3, kind: "mine", color: "cyan", row: 6, sees: 2 }];
  /** Wide, and short enough that the field is limited by its height. A browser
   * window on a desk, not an exotic viewport. */
  const LAPTOP = { width: 1200, height: 700, dpr: 1 };

  function mined(): World {
    const world = createWorld(CFG, 3, MINE);
    for (let t = 0; t < ticksPerBeat(CFG) * 2; t++) step(world, []);
    expect(
      world.creatures.map((c) => c.kind),
      "no mine reached the field",
    ).toContain("mine");
    return world;
  }

  /** Where the one ring stands and how big it is, off the frame. */
  function ring(l: Layout, world: World, clearTop?: number): { x: number; y: number; r: number } {
    const { ctx } = stubCanvas();
    ctx.log = [];
    drawMineFuses(ctx as unknown as CanvasRenderingContext2D, l, world, clearTop);
    const pips = (ctx.log ?? [])
      .map((line) => /^arc\(([-\d.]+), ([-\d.]+),/.exec(line))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
    expect(pips.length, "the blind seat was drawn no ring at all").toBeGreaterThan(2);
    const x = pips.reduce((a, p) => a + p.x, 0) / pips.length;
    const y = pips.reduce((a, p) => a + p.y, 0) / pips.length;
    const r = pips.reduce((a, p) => a + Math.hypot(p.x - x, p.y - y), 0) / pips.length;
    return { x, y, r };
  }

  for (const [name, viewport] of [
    ["a laptop window", LAPTOP],
    ["a phone", PHONE],
  ] as const) {
    it(`stands clear of the siren's dial on ${name}`, () => {
      const l = computeLayout(viewport, CFG, SEAT);
      const world = mined();
      expect(sirenFoot(l, world, undefined), "no mine stands, so the dial is dark").not.toBeNull();
      const { x, y, r } = ring(l, world);
      const dial = sirenCentre(l);
      const apart = Math.hypot(x - dial.x, y - dial.y);
      expect(
        apart,
        `the ring at ${Math.round(y)} is on the dial at ${Math.round(dial.y)}`,
      ).toBeGreaterThan(DIAL_R + r);
    });
  }

  it("drops with the rest of the cluster under a rehearsal's plate", () => {
    const l = computeLayout(LAPTOP, CFG, SEAT);
    const world = mined();
    const bare = ring(l, world);
    const under = ring(l, world, GUIDE_LOOK.bandFoot);
    expect(under.y - bare.y).toBeCloseTo(
      sirenCentre(l, undefined, GUIDE_LOOK.bandFoot).y - sirenCentre(l).y,
      5,
    );
  });

  it("is where it was on a screen whose field already starts below the chrome", () => {
    // The phone's own frame does not move, which is what makes this a fix and
    // not a look: the row is the lower of the two answers, and there the
    // field's own edge is already the lower (`fuseRow`).
    const l = computeLayout(PHONE, CFG, SEAT);
    expect(ring(l, mined()).y).toBeCloseTo(l.gridTop + l.tile * 0.42 * 1.3, 5);
  });
});
