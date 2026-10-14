import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type BatonState,
  batonBoss,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { batonDrawRest } from "../src/baton-grip.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";
import { spyHolds } from "./soak-spy.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE BATON's merge is two of the HOLD LAB's drops** (`baton-grip.ts`), one
 * on each seat's bead and on that seat's screen only, sunk under its own
 * thumb and never under the other's; the cue draws no second drop over it
 * (`BossCue.ownDrop`). The water is the window spent, the same on both.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

function merging(thumbs = 0): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("baton");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < (CFG.batonSockets + 1) * TPB; i++) step(world, []);
  const b = batonBoss(world);
  const first = b?.beads[0];
  if (b === null || first === undefined || b.stage !== "passing") throw new Error("no bead sat");
  first.socket = CFG.batonSockets - 1;
  b.beads.push({ ...first, socket: CFG.batonSockets - 2, color: "cyan" });
  b.stage = "merging";
  b.stageBeat = world.beat;
  b.mergeThumbs = thumbs;
  return world;
}

function arm(world: World): BatonState {
  const b = batonBoss(world);
  if (b === null) throw new Error("no arm");
  return b;
}

const drops = (world: World, role: ViewRole) => spyHolds(() => runFrames(world, role, 1)).holds;

describe("THE BATON's merge", () => {
  it("is one drop on each screen, on that seat's own bead", () => {
    for (const [role, seat] of [
      ["p1", 1],
      ["p2", 2],
    ] as const) {
      const world = merging();
      const got = drops(world, role);
      expect(got.length).toBe(1);
      // Within a few pixels of its rest — the arm sways, and the drop with it.
      const l = computeLayout(VIEWPORT, CFG, role);
      const own = batonDrawRest(l, CFG, arm(world), seat);
      const other = batonDrawRest(l, CFG, arm(world), seat === 1 ? 2 : 1);
      const at = got[0]?.at ?? { x: Number.NaN, y: Number.NaN };
      const far = (c: typeof own) => Math.hypot(at.x - (c?.x ?? 0), at.y - (c?.y ?? 0));
      expect(far(own)).toBeLessThan(l.tile / 4);
      expect(far(own)).toBeLessThan(far(other));
      expect(got[0]?.o.held).toBe(false);
    }
  });

  it("sinks under its own seat's thumb and not under the other's", () => {
    expect(drops(merging(1), "p1")[0]?.o.held).toBe(true);
    expect(drops(merging(1), "p2")[0]?.o.held).toBe(false);
    expect(drops(merging(2), "p2")[0]?.o.held).toBe(true);
  });

  it("fills as the window is spent, whether or not both are down", () => {
    const fresh = drops(merging(), "p1")[0]?.o.fill ?? -1;
    const late = merging();
    arm(late).stageBeat -= Math.floor(CFG.batonMergeWindowBeats / 2);
    const half = drops(late, "p1")[0]?.o.fill ?? -1;
    expect(half).toBeGreaterThan(fresh);
    expect(drops(merging(3), "p1")[0]?.o.fill).toBeCloseTo(fresh, 3);
  });

  it("is both drops on the desk's screen", () => {
    expect(drops(merging(), "test").length).toBe(2);
  });
});
