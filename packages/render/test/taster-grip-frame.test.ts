import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  type TasterState,
  tasterBoss,
  tasterPhase,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE TASTER's three rings, drawn** — the other half of `taster-grip.ts`,
 * which `taster-grip.test.ts` asks only about as a hit test.
 *
 * A ring fills a flat disc in `PALETTE.background` before anything else
 * (`handle-draw.ts`), and the stage paints its own background with a gradient,
 * so on most screens counting that one hex is counting rings. **On this one it
 * is not**: `drawNotch` fills a gap with the same flat colour, one per blade
 * struck off, which is why every count here has `t.shorn` taken off it. Ops
 * are no use instead — the fan grows and sheds between any two states worth
 * comparing, so a difference in them says nothing about a handle.
 *
 * **And it counts the seat's own rings**, since 22 September 2026: the dim
 * copy of the other seat's handle is still drawn (two cases below say so) and
 * punches no disc, because on this boss a punched disc is a notch and a notch
 * is how much of the fan is gone. So a count on `p1` or `p2` is that seat's
 * handles, and `test` is both seats' — which is what makes the pair of cases
 * at the end a proof rather than a restatement.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

function standing(): World {
  const world = createWorld(CFG, 7);
  const index = waveWith("taster");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

function fan(world: World): TasterState {
  const t = tasterBoss(world);
  if (t === null) throw new Error("the taster wave grew no fan");
  return t;
}

function shear(t: TasterState, n: number): void {
  for (let i = 0; i < n; i++) {
    const k = t.blades[i];
    if (k === undefined) continue;
    k.shorn = true;
    k.edge = null;
    k.layers = 0;
  }
  t.shorn = n;
}

/** One blade out of the crest and undecided: the pilot's one ring. */
function fanning(world: World): TasterState {
  const t = fan(world);
  shear(t, CFG.tasterFanShorn);
  for (let i = CFG.tasterFanShorn; i < t.blades.length; i++) {
    const k = t.blades[i];
    if (k === undefined) continue;
    k.growBeat = world.beat - 1;
    k.setBeat = i === t.blades.length - 1 ? -1 : world.beat;
  }
  expect(tasterPhase(t, CFG)).toBe("fanning");
  return t;
}

/** Six gaps, which is six of the navigator's. */
function hurrying(world: World): TasterState {
  const t = fan(world);
  shear(t, CFG.tasterHurryShorn);
  expect(tasterPhase(t, CFG)).toBe("hurrying");
  return t;
}

function closed(world: World): TasterState {
  const t = fan(world);
  shear(t, t.blades.length - CFG.tasterClosedBlades);
  expect(tasterPhase(t, CFG)).toBe("closed");
  return t;
}

function drawn(world: World, role: ViewRole): string {
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** How many rings are standing on this screen, net of the fan's own notches. */
function rings(world: World, role: ViewRole = "test"): number {
  const text = drawn(world, role);
  return count(text, PALETTE.background) - fan(world).shorn;
}

/** The seats the pin and the pry are *his* on, and the ones the wipe is
 * *hers*: the rig may press either, and each phone only one of them. */
const HIS: ViewRole[] = ROLES.filter((r) => r !== "p2");
const HERS: ViewRole[] = ROLES.filter((r) => r !== "p1");

describe("THE TASTER's rings", () => {
  it.each(HIS)("draws one on the blade that has not decided, on %s", (role) => {
    const bare = standing();
    const held = standing();
    fanning(held);
    // Nothing else about the two frames differs in a way that fills a disc.
    expect(rings(held, role)).toBeGreaterThan(rings(bare, role));
  });

  it("punches nothing on her screen for a blade only he may pin", () => {
    const bare = standing();
    const held = standing();
    fanning(held);
    expect(rings(held, "p2")).toBe(rings(bare, "p2"));
  });

  it.each(HERS)("punches one per gap on the seat that may wipe them, on %s", (role) => {
    const bare = standing();
    const many = standing();
    hurrying(many);
    expect(rings(many, role)).toBeGreaterThan(rings(bare, role));
  });

  it("punches nothing on his screen for the gaps only she may wipe", () => {
    const bare = standing();
    const many = standing();
    hurrying(many);
    expect(rings(many, "p1")).toBe(rings(bare, "p1"));
  });

  it("draws one per gap, so the row of them is what is left of the fan", () => {
    const few = standing();
    hurrying(few);
    const many = standing();
    shear(fan(many), CFG.tasterHurryShorn + 2);
    expect(rings(many) - rings(few)).toBe(2);
  });

  it("draws exactly one on the interlock", () => {
    const bare = standing();
    const shut = standing();
    closed(shut);
    expect(rings(shut) - rings(bare)).toBe(1);
  });

  it("takes the pry's ring off the moment the interlock stands open", () => {
    const shut = standing();
    closed(shut);
    const open = standing();
    closed(open).pryBeat = open.beat;
    expect(rings(open)).toBeLessThan(rings(shut));
    // He may let go — the window is a beat count, not a hold — so a ring left
    // standing would be asking for a second carry the round refuses.
    expect(rings(open)).toBe(rings(standing()));
  });

  it("dims the pilot's ring on the navigator's screen, and hers on his", () => {
    // Both seats see every handle: she is firing on the window his pin buys,
    // and he is under the crest waiting on her beam (`sinew-handles.ts`).
    const his = standing();
    fanning(his);
    expect(count(drawn(his, "p2"), PALETTE.dim)).toBeGreaterThan(
      count(drawn(his, "p1"), PALETTE.dim),
    );
    const hers = standing();
    hurrying(hers);
    expect(count(drawn(hers, "p1"), PALETTE.dim)).toBeGreaterThan(
      count(drawn(hers, "p2"), PALETTE.dim),
    );
  });

  it.each(ROLES)("has none at all once the fan is going out, on %s", (role) => {
    // `tasterHandsHeard` drops every command past `outBeat`, and all three
    // gates are read off `tasterPhase`, which says `out` before anything else.
    for (const build of [fanning, hurrying, closed]) {
      const going = standing();
      build(going).outBeat = going.beat;
      expect(rings(going, role)).toBe(0);
    }
  });

  it("lights the pin's ring while his thumb is on it", () => {
    const loose = standing();
    fanning(loose);
    const pinned = standing();
    const t = fanning(pinned);
    t.pin = t.blades.length - 1;
    t.pinBeats = CFG.tasterPinBeats - 1;
    // The dial is the clock the blade decides on, so a held ring names the
    // rim colour a loose one does not (`drawHandleRing`).
    expect(count(drawn(pinned, "test"), PALETTE.text)).toBeGreaterThan(
      count(drawn(loose, "test"), PALETTE.text),
    );
  });
});
