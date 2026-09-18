import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  NO_TETHER,
  startWave,
  step,
  ticksPerBeat,
  type WardenState,
  type World,
  wardenEyeOpen,
  wardenPullMilli,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { wardenEyeCircle } from "../src/warden.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE WARDEN, and the three words the field may say about it**
 * (`render/src/boss-cue-read-f.ts`).
 *
 * The picture is the same on both screens — this boss has no `showsWarden`
 * anything — so what the cases hold is the *other* half of `decisions.md` #34:
 * the colour is never said, on any screen, in any state, and the rope's own
 * `PULL` and the cue's are never up at once.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/**
 * The boss with a rope down and nobody on it.
 *
 * Stepped to the attach rather than set: the eye is shut while there is no
 * tether at all (`wardenEyeOpen`), so a case that reached in and set a taut
 * pull on a boss whose line had not come down yet would be testing a state the
 * fight never has. One line per cycle, and it arrives on the cycle's own beat.
 */
function opened(): { world: World; b: WardenState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("warden");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = world.boss;
  if (b === null || b.kind !== "warden") throw new Error("the warden's wave installed no warden");
  let guard = 0;
  while (b.tetherId === NO_TETHER && guard++ < 60 * ticksPerBeat(CFG)) step(world, []);
  if (b.tetherId === NO_TETHER) throw new Error("the warden never dropped a rope");
  return { world, b };
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

/**
 * A hand on the rope, carried far enough to make the line taut — **downward**,
 * which is the one direction the field always has room for from where this rope
 * hangs (`sim/handle-pull.ts`, and `warden-frame.test.ts` drives it the same
 * way).
 */
function taut(world: World, b: WardenState): void {
  b.pulling = true;
  b.pullMilli = 0;
  b.pullYMilli = world.cfg.wardenTautMilli;
  b.eyeSpent = false;
  if (!wardenEyeOpen(world, b)) throw new Error("a pull at the taut distance did not open it");
}

describe("THE WARDEN", () => {
  it("says nothing to either seat while the rope hangs free", () => {
    const { world, b } = opened();
    expect(b.pulling).toBe(false);
    expect(wardenEyeOpen(world, b)).toBe(false);
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });

  it("asks the pilot to PULL once his hand is on it and the line is short", () => {
    const { world, b } = opened();
    b.pulling = true;
    b.pullYMilli = Math.floor(world.cfg.wardenTautMilli / 3);
    expect(wardenEyeOpen(world, b)).toBe(false);
    const c = cue(world, "p1");
    expect(c?.word).toBe("PULL");
    expect(c?.kind).toBe("CARRY");
    expect(c?.seat).toBe(1);
    // Her window is shut, so she is owed nothing.
    expect(cue(world, "p2")).toBeNull();
  });

  it("turns his word to HOLD and puts FIRE on the pupil once it is open", () => {
    const { world, b } = opened();
    taut(world, b);

    const his = cue(world, "p1");
    expect(his?.word).toBe("HOLD");
    expect(his?.kind).toBe("HOLD");

    const hers = cue(world, "p2");
    expect(hers?.word).toBe("FIRE");
    expect(hers?.seat).toBe(2);
    const body = world.creatures.find((c) => c.id === b.creatureId);
    if (body === undefined) throw new Error("the warden has no body on the field");
    const eye = wardenEyeCircle(LAYOUT.p2, body, b, wardenPullMilli(world, b) / 1000);
    expect(hers?.x).toBeCloseTo(eye.x, 6);
    expect(hers?.y).toBeCloseTo(eye.y, 6);
  });

  // The pull that reaches taut is the downward one — it is the only direction
  // with room (`bosses.md` 11.4) — so the hand finishes the gesture on the
  // ship, and the field is drawn before the hull is. A mark left where the hand
  // actually is would have its verb painted over by the plating.
  it("stops his mark clear of the plating, however far down the rope is carried", () => {
    const { world, b } = opened();
    taut(world, b);
    const c = cue(world, "p1");
    if (c === null) throw new Error("the pilot was owed a word and got none");
    const l = LAYOUT.p1;
    // The frame and the verb hung under it, both above the hull line.
    expect(c.y + c.halfH).toBeLessThan(l.hullY);
    expect(l.hullY - (c.y + c.halfH)).toBeGreaterThan(l.tile * 0.5);
  });

  it("goes quiet on both seats once the opening has taken its hit", () => {
    const { world, b } = opened();
    taut(world, b);
    b.eyeSpent = true;
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });

  it("never says the colour: three words, whatever the cycle and wherever the pupil is", () => {
    const { world, b } = opened();
    const seen = new Set<string>();
    for (let waveBeat = 1; waveBeat <= world.cfg.wardenCycleBeats * 2; waveBeat++) {
      world.waveBeat = waveBeat;
      for (const pupilCol of [0, 2, CFG.cols - 1]) {
        b.pupilCol = pupilCol;
        for (const pull of [
          0,
          Math.floor(world.cfg.wardenTautMilli / 2),
          world.cfg.wardenTautMilli,
        ]) {
          b.pulling = true;
          b.pullMilli = 0;
          b.pullYMilli = pull;
          for (const role of ["p1", "p2"] as const) {
            const c = cue(world, role);
            if (c !== null) seen.add(`${c.kind}\u00b7${c.word}\u00b7${c.seat}`);
          }
        }
      }
    }
    expect([...seen].sort()).toEqual([
      "CARRY\u00b7PULL\u00b71",
      "HOLD\u00b7HOLD\u00b71",
      "PRESS\u00b7FIRE\u00b72",
    ]);
  });
});
