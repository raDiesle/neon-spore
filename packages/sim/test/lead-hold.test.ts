import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  midCol,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import {
  type LeadState,
  leadAim,
  leadBoss,
  leadGrippable,
  leadHolding,
  leadPace,
  leadPassing,
  leadStill,
} from "../src/lead.js";
import { leadStruck } from "../src/lead-shot.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * **THE LEAD's stalk under the navigator's thumb** — the one state of this
 * boss a hand may reach into, and everything that follows from that being
 * true only there.
 *
 * The fight shipped answered entirely on the panel: aim, fire, ward, fill.
 * The still is the hole in `grippable.ts`' refusal of a hand on a boss body,
 * because with one segment left the body is unshootable and no bolt is
 * registered against it at all — a thumb there can steer nothing, and what
 * it has instead is time (`lead-hand.ts`, `drag-targets-c.ts`).
 *
 * So what these pin is the bargain: that the still may be taken while it is
 * standing, that it does not run out under a thumb, that the beat she lets
 * go of it is the beat it passes, that `leadHoldBeats` tears it out of her
 * whether she is ready or not, that a still once spent cannot be taken
 * twice, that a wall is a whole new still and may be taken again, that the
 * pilot's seat cannot take it at all, and that the hold is in the hash —
 * two phones that disagreed about whose thumb was down would disagree about
 * where the body is a beat later.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "lead" });
  return world;
}

function body(world: World): LeadState {
  const s = leadBoss(world);
  if (s === null) throw new Error("no body installed");
  return s;
}

/** Run `n` beats, and say which of the boss's events went by. */
function beats(world: World, n: number, cmds: TimedCommand[] = []): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** A shot that has just left through the top of `col`, the way `bullets.ts` hands one over. */
function shot(world: World, col: number, color: Color = "red"): Bullet {
  return {
    id: world.nextId++,
    col,
    row: 0,
    subMilli: 0,
    color,
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}

/** The body stopped dead in `col`, the way the fourth hit leaves it (`lead.test.ts`'s). */
function stilled(world: World, col = midCol(CFG)): LeadState {
  const s = body(world);
  s.segments = 2;
  s.col = col - s.dir * leadPace(s, CFG);
  leadStruck(world, shot(world, leadAim(s, CFG)));
  beats(world, 1);
  if (!leadStill(s)) throw new Error("the fourth hit did not stop it");
  return s;
}

/** Her thumb on the stalk, or off it. */
const stalk = (tick: number, on: boolean, player: 1 | 2 = 2): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "leadStalk", on, fromMilli: 0, fromYMilli: 0 },
});

describe("taking the stalk", () => {
  it("is on offer only while the body stands still", () => {
    const world = open();
    expect(leadGrippable(body(world))).toBe(false);
    const s = stilled(world);
    expect(leadGrippable(s)).toBe(true);
  });

  it("goes down on the tick, and says so", () => {
    const world = open();
    const s = stilled(world);
    const at = world.tick;
    const took = world.beat;
    const seen = beats(world, 1, [stalk(at, true)]);
    expect(leadHolding(s)).toBe(true);
    // The beat it went down on, and not some later one: `heldBeat` is the foot
    // of the fuse `leadTorn` measures `leadHoldBeats` from.
    expect(s.heldBeat).toBe(took);
    expect(seen.has("leadGrip")).toBe(true);
  });

  it("is refused to the pilot, without a sound", () => {
    const world = open();
    const s = stilled(world);
    const seen = beats(world, 1, [stalk(world.tick, true, 1)]);
    expect(leadHolding(s)).toBe(false);
    expect(seen.has("leadGrip")).toBe(false);
  });
});

describe("what the hold is worth", () => {
  it("stops the still running out: it stands past the beat it would have passed on", () => {
    const world = open();
    const s = stilled(world);
    beats(world, 1, [stalk(world.tick, true)]);
    beats(world, CFG.leadStillBeats + 1);
    expect(leadStill(s)).toBe(true);
    expect(leadPassing(s)).toBe(false);
    expect(leadHolding(s)).toBe(true);
  });

  it("leans the way the pass will go from the beat it is taken", () => {
    const world = open();
    const s = stilled(world);
    expect(s.lean).toBe(0);
    beats(world, 2, [stalk(world.tick, true)]);
    expect(s.lean).not.toBe(0);
  });

  it("passes on the beat she lets go, and says so", () => {
    const world = open();
    const s = stilled(world);
    beats(world, 1, [stalk(world.tick, true)]);
    beats(world, 1);
    const seen = beats(world, 2, [stalk(world.tick, false)]);
    expect(seen.has("leadRelease")).toBe(true);
    expect(seen.has("leadPass")).toBe(true);
    expect(leadHolding(s)).toBe(false);
  });

  it("tears out of her after leadHoldBeats and passes anyway", () => {
    const world = open();
    const s = stilled(world);
    const seen = beats(world, CFG.leadHoldBeats + 2, [stalk(world.tick, true)]);
    expect(seen.has("leadTear")).toBe(true);
    expect(seen.has("leadPass")).toBe(true);
    expect(leadHolding(s)).toBe(false);
  });

  it("cannot be taken twice in one still", () => {
    const world = open();
    const s = stilled(world);
    beats(world, 1, [stalk(world.tick, true)]);
    beats(world, 1, [stalk(world.tick, false)]);
    expect(leadGrippable(s)).toBe(false);
  });

  it("is on offer again at the wall, which is a whole new still", () => {
    const world = open();
    const s = stilled(world);
    beats(world, 1, [stalk(world.tick, true)]);
    beats(world, 1, [stalk(world.tick, false)]);
    beats(world, CFG.leadStillBeats + CFG.cols + 2);
    expect(leadStill(s)).toBe(true);
    expect(leadGrippable(s)).toBe(true);
  });
});

describe("the hold on the wire", () => {
  it("is in the hash: two phones that disagree about the thumb disagree about the fingerprint", () => {
    const held = open();
    const alone = open();
    const a = stilled(held);
    stilled(alone);
    beats(held, 1, [stalk(held.tick, true)]);
    beats(alone, 1);
    expect(leadHolding(a)).toBe(true);
    expect(hashWorld(held)).not.toBe(hashWorld(alone));
  });
});
