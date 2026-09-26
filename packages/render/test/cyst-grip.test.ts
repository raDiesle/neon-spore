import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  type CystAsk,
  type CystState,
  createWorld,
  cystBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bossCue } from "../src/boss-cue.js";
import { cystFlankCircle, cystMarkCircle } from "../src/cyst-grip.js";
import { bossThumb } from "../src/guide-boss-hand.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { pinching } from "../src/pinch.js";
import { type Field, touchDown } from "../src/touch.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real fingers on THE CYST, and the words over it** (`cyst-grip.ts`,
 * `boss-cue-read-zi.ts`): each seat's tap lands on its partner's freeze mark
 * and sends at once; each seat's pinch zone is its own flank's side and says
 * nothing until a second finger is down; and the field says `TAP` to the
 * freezer while a flank is lit, `SHUT` to the pincher once it is stilled,
 * `SHUT` to both on a swell, and `FIRE` at the hull while the core is bared.
 */

beforeAll(installCanvasGlobals);

const STANDARD: ControlSet = controlSet("default");
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const BEAT_PHASE = 0.4;
const TPB = ticksPerBeat(CFG);

const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

/** The sac stood, the first step asking `ask` lit. */
function lit(ask: CystAsk = "left"): { world: World; s: CystState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("cyst");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.cystStillBeats + 1); i++) step(world, []);
  const s = cystBoss(world);
  if (s === null) throw new Error("the cyst wave stood no sac");
  const at = s.steps.findIndex((x) => x.ask === ask);
  if (at < 0) throw new Error(`the cyst script has no ${ask} step`);
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = at;
  s.gapMilli = [CFG.cystOpenMilli, CFG.cystOpenMilli];
  return { world, s };
}

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: BEAT_PHASE,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

function press(world: World, role: ViewRole, seat: 1 | 2, at: { x: number; y: number }) {
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

const mark = (world: World, s: CystState, role: ViewRole, side: 0 | 1) =>
  cystMarkCircle(layout(role), CFG, s, side, world.beat, BEAT_PHASE);
const flank = (world: World, s: CystState, role: ViewRole, side: 0 | 1) =>
  cystFlankCircle(layout(role), CFG, s, side, world.beat, BEAT_PHASE);

describe("a finger on THE CYST", () => {
  it.each(ROLES)("taps the partner's mark, sent at once, on %s", (role) => {
    const { world, s } = lit();
    const one = press(world, role, 1, mark(world, s, role, 1));
    expect(target(one)).toBe("cystFreezeRight");
    expect(one?.command).toMatchObject({ kind: "drag", target: "cystFreezeRight", on: true });
    expect(target(press(world, role, 2, mark(world, s, role, 0)))).toBe("cystFreezeLeft");
  });

  it.each(ROLES)("takes each seat's pinch on its own flank and says nothing yet, on %s", (role) => {
    const { world, s } = lit();
    const one = press(world, role, 1, flank(world, s, role, 0));
    expect(target(one)).toBe("cystFlankLeft");
    expect(one?.command).toBeNull();
    const hold = one?.hold;
    if (!hold || !pinching(hold)) throw new Error("no pinch hold");
    expect(target(press(world, role, 2, flank(world, s, role, 1)))).toBe("cystFlankRight");
  });

  it.each(ROLES)("pinches nothing on the other seat's side, on %s", (role) => {
    const { world, s } = lit();
    expect(target(press(world, role, 1, flank(world, s, role, 1)))).not.toBe("cystFlankLeft");
    expect(target(press(world, role, 2, flank(world, s, role, 0)))).not.toBe("cystFlankRight");
  });

  it("refuses a press rows away from the sac", () => {
    const { world, s } = lit();
    const at = flank(world, s, "p1", 0);
    const far = { x: at.x, y: at.y + layout("p1").tile * 5 };
    expect(target(press(world, "p1", 1, far))).not.toBe("cystFlankLeft");
  });

  it("offers nothing once the sac has split", () => {
    const { world, s } = lit();
    const at = flank(world, s, "p1", 0);
    s.phase = "split";
    expect(target(press(world, "p1", 1, at))).not.toBe("cystFlankLeft");
    for (const t of ["cystFlankLeft", "cystFreezeRight"] as const) {
      expect(handleCircle(layout("test"), world, t, BEAT_PHASE)).toBeNull();
    }
  });

  it("stands a ghost thumb on a flank while it is closing, and none while open", () => {
    const { world, s } = lit();
    const l = layout("test");
    expect(bossThumb(l, world, 1, BEAT_PHASE)).toBeNull();
    s.gapMilli = [1200, CFG.cystOpenMilli];
    expect(bossThumb(l, world, 1, BEAT_PHASE)).toEqual(
      handleCircle(l, world, "cystFlankLeft", BEAT_PHASE),
    );
    expect(bossThumb(l, world, 2, BEAT_PHASE)).toBeNull();
  });
});

describe("the words over THE CYST", () => {
  const cue = (world: World, role: ViewRole) => {
    const l = layout(role);
    return bossCue(l, world, BEAT_PHASE, () => l.hullY);
  };

  it("says TAP on the lit flank's mark to the freezer, and nothing to the pincher", () => {
    const { world } = lit("left");
    const c = cue(world, "p2");
    expect(c?.word).toBe("TAP");
    expect(c?.seat).toBe(2);
    expect(cue(world, "p1")).toBeNull();
  });

  it("says SHUT to the pincher once the flank is stilled, gone while it is held", () => {
    const { world, s } = lit("left");
    s.phase = "frozen";
    const c = cue(world, "p1");
    expect(c?.word).toBe("SHUT");
    expect(c?.seat).toBe(1);
    s.gapMilli[0] = CFG.cystShutMilli;
    expect(cue(world, "p1")).toBeNull();
  });

  it("says SHUT to both seats on a swell", () => {
    const { world } = lit("swell");
    expect(cue(world, "p1")?.word).toBe("SHUT");
    expect(cue(world, "p2")?.word).toBe("SHUT");
  });

  it("says FIRE at the hull only while the core is bared", () => {
    const { world, s } = lit("fire");
    s.bared = false;
    expect(cue(world, "p1")).toBeNull();
    s.bared = true;
    const c = cue(world, "p1");
    expect(c?.word).toBe("FIRE");
    expect(c?.y).toBe(layout("p1").hullY);
  });

  it("says nothing between steps", () => {
    const { world, s } = lit();
    s.phase = "rest";
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });
});
