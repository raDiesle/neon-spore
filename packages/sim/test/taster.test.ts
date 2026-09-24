import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  midCol,
  type SimConfig,
  slowing,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { spendShot } from "../src/spend.js";
// The fan's own readers, from the file rather than the package surface: what
// leaves `packages/sim` for this boss today is its entry and nothing else, and
// the lane that draws it is the one that will need the rest (`bosses.ts`).
import {
  type TasterState,
  tasterBladeAt,
  tasterBoss,
  tasterGrowing,
  tasterLean,
  tasterLifted,
  tasterOrder,
  tasterPhase,
  tasterPried,
  tasterSoft,
  tasterStanding,
  tasterWeak,
  tasterWindow,
} from "../src/taster.js";
import { tasterHandsHeard } from "../src/taster-hand.js";
import { tasterStruck } from "../src/taster-shot.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE TASTER, and the sentence it is built to make true: **the colour you keep
 * firing is the colour that stops working.** Every blade grows in whichever
 * colour the pair has been leaning on, and a blade is struck off by the colour
 * it is *not* — the one inverted colour rule in the game, which is why most of
 * what is checked here is which way round a shot lands.
 *
 * Nothing of the look is checked: the crest, the blades and the fan unlocking
 * are render's, and this file only ever asks what the rule says.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "taster" });
  return world;
}

function fan(world: World): TasterState {
  const t = tasterBoss(world);
  if (t === null) throw new Error("no fan installed");
  return t;
}

/** Run `n` beats, and say which of the boss's events went by. */
function beats(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** A shot that has just left through the top of `col`, the way `bullets.ts` hands one over. */
function shot(world: World, col: number, color: Color = "red", lance = false): Bullet {
  return { id: world.nextId++, col, row: 0, subMilli: 0, color, lance, driftMilli: 0, aimMilli: 0 };
}

/** `n` beams of one colour into the interlock, `tasterPryFills` unless said. */
function beams(world: World, t: TasterState, color: Color, n = CFG.tasterPryFills): void {
  for (let i = 0; i < n; i++) tasterStruck(world, shot(world, t.col, color, true));
}

/** `n` colours out of the muzzle, without a shot on the field. */
function spend(world: World, n: number, color: Color): void {
  for (let i = 0; i < n; i++) spendShot(world, color);
}

/** One blade, grown and edged in `color` by hand — the state, not the wait. */
function edged(t: TasterState, i: number, color: Color, layers = 1): void {
  const k = t.blades[i];
  if (k === undefined) throw new Error(`no blade ${i}`);
  k.edge = color;
  k.layers = layers;
  k.growBeat = 0;
  k.setBeat = 0;
  k.shorn = false;
}

/** `n` blades struck off by hand, from the outside in, so a phase can be set. */
function shearOff(t: TasterState, n: number): void {
  for (let i = 0; i < n; i++) {
    const k = t.blades[i];
    if (k === undefined) continue;
    k.shorn = true;
    k.edge = null;
    k.layers = 0;
    t.shorn += 1;
  }
}

describe("the crest arriving", () => {
  it("is centred, as wide as the field allows, with nothing out of it yet", () => {
    const world = open();
    const t = fan(world);
    expect(t.blades.length).toBe(Math.min(CFG.tasterBlades, CFG.cols));
    expect(t.col + Math.floor(t.blades.length / 2)).toBe(midCol(CFG));
    expect(t.blades.every((k) => k.growBeat < 0 && k.edge === null)).toBe(true);
    expect(tasterStanding(t)).toBe(0);
    expect(tasterPhase(t, CFG)).toBe("opening");
    expect(world.events.some((e) => e.type === "tasterRise")).toBe(true);
  });

  it("opens its blades from the middle outward", () => {
    // The order is a pure function of the width, so it is asked directly —
    // nothing in the world can move it, which is the point of it.
    expect(tasterOrder(5)).toEqual([2, 3, 1, 4, 0]);
    expect(tasterOrder(1)).toEqual([0]);
    const world = open();
    const t = fan(world);
    beats(world, 1);
    expect(t.blades[tasterOrder(t.blades.length)[0] ?? 0]?.growBeat).toBeGreaterThanOrEqual(0);
    expect(tasterGrowing(t)).toBe(1);
  });

  it("grows one blade at a time while it is opening, and holds it there", () => {
    const world = open();
    const t = fan(world);
    // A blade takes `tasterGrowBeats` to decide, and nothing else comes out of
    // the crest until it has: the first movement is one blade at a time.
    beats(world, CFG.tasterGrowBeats - 1);
    expect(tasterGrowing(t)).toBe(1);
    expect(tasterStanding(t)).toBe(0);
  });
});

describe("the colour a blade grows in", () => {
  it("is the colour the pair has been leaning on, and no longer slows the beat it sets", () => {
    const world = open();
    const t = fan(world);
    spend(world, 5, "cyan");
    spend(world, 1, "red");
    expect(tasterLean(world, t)).toBe("cyan");
    const seen = beats(world, CFG.tasterGrowBeats + 1);
    expect(seen.has("tasterSet")).toBe(true);
    expect(tasterStanding(t)).toBe(1);
    expect(t.blades.find((k) => k.setBeat >= 0)?.edge).toBe("cyan");
    // THE SLOW moved to the pry on 24 September 2026 (`taster-hand.ts`).
    expect(slowing(world)).toBe(false);
  });

  it("is rolled off the seeded rng on a dead heat, the same way on both devices", () => {
    const a = open(11);
    const b = open(11);
    for (const w of [a, b]) {
      spend(w, 3, "red");
      spend(w, 3, "cyan");
      expect(tasterLean(w, fan(w))).toBeNull();
      beats(w, CFG.tasterGrowBeats + 1);
    }
    const first = (w: World): Color | null =>
      fan(w).blades.find((k) => k.setBeat >= 0)?.edge ?? null;
    expect(first(a)).not.toBeNull();
    expect(first(a)).toBe(first(b));
    expect(hashWorld(a)).toBe(hashWorld(b));
  });

  it("tastes a shorter window once the fight is hurrying", () => {
    const world = open();
    const t = fan(world);
    expect(tasterWindow(t, CFG)).toBe(CFG.tasterWindowBeats);
    shearOff(t, CFG.tasterHurryShorn);
    expect(tasterPhase(t, CFG)).toBe("hurrying");
    expect(tasterWindow(t, CFG)).toBe(CFG.tasterFastWindowBeats);
  });
});

describe("the inverted rule", () => {
  it("thickens a blade struck in its own colour, and counts the miss", () => {
    const world = open();
    const t = fan(world);
    edged(t, 4, "red");
    tasterStruck(world, shot(world, t.col + 4, "red"));
    expect(t.blades[4]?.layers).toBe(2);
    expect(t.blades[4]?.shorn).toBe(false);
    expect(world.balance.colorMisses).toBe(1);
    expect(world.events.some((e) => e.type === "tasterThick")).toBe(true);
  });

  it("thickens no further than the cap, however long the pair leans", () => {
    const world = open();
    const t = fan(world);
    edged(t, 4, "red");
    for (let i = 0; i < 6; i++) tasterStruck(world, shot(world, t.col + 4, "red"));
    expect(t.blades[4]?.layers).toBe(CFG.tasterThickMax);
  });

  it("pares a thickened blade with the other colour, then takes it off", () => {
    const world = open();
    const t = fan(world);
    edged(t, 4, "red", CFG.tasterThickMax);
    tasterStruck(world, shot(world, t.col + 4, "cyan"));
    expect(t.blades[4]?.shorn).toBe(false);
    expect(t.blades[4]?.layers).toBe(CFG.tasterThickMax - 1);
    expect(world.events.some((e) => e.type === "tasterPare")).toBe(true);
    tasterStruck(world, shot(world, t.col + 4, "cyan"));
    expect(t.blades[4]?.shorn).toBe(true);
    expect(t.shorn).toBe(1);
    expect(world.balance.colorHits).toBe(2);
    expect(world.events.some((e) => e.type === "tasterShear")).toBe(true);
  });

  it("ignores a shot off the crest's ends, and one at a blade that has not decided", () => {
    const world = open();
    const t = fan(world);
    expect(tasterBladeAt(t, t.col - 1)).toBe(-1);
    tasterStruck(world, shot(world, t.col - 1));
    tasterStruck(world, shot(world, t.col + t.blades.length));
    // Grown, no colour yet: the shot is simply spent, the way one past the top
    // of any other field is.
    const k = t.blades[2];
    if (k !== undefined) k.growBeat = 0;
    tasterStruck(world, shot(world, t.col + 2));
    expect(t.shorn).toBe(0);
    expect(world.balance.colorHits + world.balance.colorMisses).toBe(0);
  });
});

describe("the soft crest", () => {
  it("swallows a shot of either colour for nothing at all", () => {
    const world = open();
    const t = fan(world);
    shearOff(t, 1);
    expect(tasterSoft(t, 0)).toBe(true);
    tasterStruck(world, shot(world, t.col, "red"));
    tasterStruck(world, shot(world, t.col, "cyan"));
    expect(t.crest).toBe(2);
    // The one target in this fight with no colour: it is not a colour moment,
    // so the balance sheet says nothing either way.
    expect(world.balance.colorHits).toBe(0);
    expect(world.balance.colorMisses).toBe(0);
    expect(world.events.filter((e) => e.type === "tasterCrest").length).toBe(2);
  });

  it("lifts for good once it has been cut through, and only once", () => {
    const world = open();
    const t = fan(world);
    shearOff(t, 1);
    expect(tasterLifted(t)).toBe(false);
    for (let i = 0; i < CFG.tasterCrestCuts; i++) tasterStruck(world, shot(world, t.col));
    expect(tasterLifted(t)).toBe(true);
    expect(world.events.filter((e) => e.type === "tasterLift").length).toBe(1);
    const lift = t.liftBeat;
    tasterStruck(world, shot(world, t.col));
    expect(t.liftBeat).toBe(lift);
    expect(world.events.filter((e) => e.type === "tasterLift").length).toBe(1);
  });
});

describe("the fan noticing", () => {
  it("re-edges every standing blade when the majority flips", () => {
    const world = open();
    const t = fan(world);
    shearOff(t, CFG.tasterHurryShorn);
    edged(t, 8, "red");
    edged(t, 9, "red");
    t.edgeBeat = 0;
    world.beat = CFG.tasterEdgeBeats;
    spend(world, 4, "cyan");
    const seen = beats(world, 1);
    expect(seen.has("tasterTaste")).toBe(true);
    expect(t.blades[8]?.edge).toBe("cyan");
    expect(t.blades[9]?.edge).toBe("cyan");
  });

  it("never re-edges once the crest is cut through", () => {
    const world = open();
    const t = fan(world);
    shearOff(t, CFG.tasterHurryShorn);
    edged(t, 8, "red");
    t.edgeBeat = 0;
    t.liftBeat = 0;
    world.beat = CFG.tasterEdgeBeats;
    spend(world, 4, "cyan");
    expect(beats(world, 1).has("tasterTaste")).toBe(false);
    expect(t.blades[8]?.edge).toBe("red");
  });

  it("never re-edges on a dead heat, because there is no majority to turn to", () => {
    const world = open();
    const t = fan(world);
    shearOff(t, CFG.tasterHurryShorn);
    edged(t, 8, "red");
    t.edgeBeat = 0;
    world.beat = CFG.tasterEdgeBeats;
    spend(world, 2, "red");
    spend(world, 2, "cyan");
    expect(beats(world, 1).has("tasterTaste")).toBe(false);
    expect(t.blades[8]?.edge).toBe("red");
  });
});

describe("the interlock", () => {
  function closed(seed = 3): { world: World; t: TasterState } {
    const world = open(seed);
    const t = fan(world);
    shearOff(t, t.blades.length - CFG.tasterClosedBlades);
    for (let i = t.blades.length - CFG.tasterClosedBlades; i < t.blades.length; i++)
      edged(t, i, "red");
    expect(tasterPhase(t, CFG)).toBe("closed");
    return { world, t };
  }

  /** The pilot's carry, all the way down: the interlock apart and the window open. */
  function pryOpen(world: World, t: TasterState): void {
    tasterHandsHeard(world, 1, {
      kind: "drag",
      target: "tasterLock",
      on: true,
      fromMilli: 0,
      fromYMilli: CFG.tasterPryMilli,
    });
    expect(tasterPried(t, world.beat, CFG)).toBe(true);
  }

  it("refuses the beam itself while the interlock is still shut", () => {
    const { world, t } = closed();
    spend(world, 5, "red");
    // The colour is the right one; the fan is not open, and that is checked
    // first, because *early* and *wrong colour* are two different sentences
    // for the pair to say (`taster-shot.ts`).
    tasterStruck(world, shot(world, t.col, "cyan", true));
    expect(t.outBeat).toBe(-1);
    expect(world.balance.colorHits).toBe(0);
    expect(world.balance.colorMisses).toBe(0);
    expect(world.events.some((e) => e.type === "tasterRefused")).toBe(true);
  });

  it("refuses a single bolt of either colour, and counts nothing for it", () => {
    const { world, t } = closed();
    const col = t.blades.length - 1 + t.col;
    tasterStruck(world, shot(world, col, "red"));
    tasterStruck(world, shot(world, col, "cyan"));
    expect(t.outBeat).toBe(-1);
    expect(world.balance.colorHits).toBe(0);
    expect(world.balance.colorMisses).toBe(0);
    expect(world.events.filter((e) => e.type === "tasterRefused").length).toBe(2);
  });

  it("opens to the beam in the colour the pair has spent least of", () => {
    const { world, t } = closed();
    spend(world, 5, "red");
    pryOpen(world, t);
    expect(tasterWeak(world, t)).toBe("cyan");
    beams(world, t, "cyan", CFG.tasterPryFills - 1);
    expect(t.outBeat).toBe(-1);
    expect(world.events.some((e) => e.type === "tasterOut")).toBe(false);
    expect(world.events).toContainEqual({
      type: "tasterPryFill",
      col: t.col,
      color: "cyan",
      owed: 1,
    });
    beams(world, t, "cyan", 1);
    expect(t.outBeat).toBe(world.beat);
    expect(tasterPhase(t, CFG)).toBe("out");
    expect(world.balance.colorHits).toBe(CFG.tasterPryFills);
    expect(world.events.some((e) => e.type === "tasterOut")).toBe(true);
  });

  it("slows the beat for exactly the pry, and the last beam shuts it", () => {
    const { world, t } = closed();
    spend(world, 5, "red");
    expect(slowing(world)).toBe(false);
    pryOpen(world, t);
    expect(world.slowToBeat).toBe(world.beat + CFG.tasterPryBeats);
    beams(world, t, "cyan");
    expect(slowing(world)).toBe(false);
  });

  it("lets a pry that runs out take its slow and its beams with it", () => {
    const { world, t } = closed();
    spend(world, 5, "red");
    pryOpen(world, t);
    beams(world, t, "cyan", CFG.tasterPryFills - 1);
    beats(world, CFG.tasterPryBeats + 1);
    expect(tasterPried(t, world.beat, CFG)).toBe(false);
    expect(t.pryFills).toBe(0);
    expect(slowing(world)).toBe(false);
  });

  it("refuses the beam in the colour it has been fed, and counts that miss", () => {
    const { world, t } = closed();
    spend(world, 5, "red");
    pryOpen(world, t);
    tasterStruck(world, shot(world, t.col, "red", true));
    expect(t.outBeat).toBe(-1);
    expect(world.balance.colorMisses).toBe(1);
    expect(world.events.some((e) => e.type === "tasterRefused")).toBe(true);
  });

  it("has no weak colour at all while the pair has spent evenly", () => {
    const { world, t } = closed();
    spend(world, 3, "red");
    spend(world, 3, "cyan");
    pryOpen(world, t);
    expect(tasterWeak(world, t)).toBeNull();
    tasterStruck(world, shot(world, t.col, "cyan", true));
    tasterStruck(world, shot(world, t.col, "red", true));
    expect(t.outBeat).toBe(-1);
    expect(world.balance.colorMisses).toBe(2);
  });

  it("holds the wave for its last beats, then goes", () => {
    const { world, t } = closed();
    spend(world, 5, "red");
    pryOpen(world, t);
    beams(world, t, "cyan");
    beats(world, CFG.tasterOutBeats - 1);
    expect(tasterBoss(world)).not.toBeNull();
    beats(world, 2);
    expect(tasterBoss(world)).toBeNull();
  });

  it("takes nothing more once the beam has gone in", () => {
    const { world, t } = closed();
    spend(world, 5, "red");
    pryOpen(world, t);
    beams(world, t, "cyan");
    const hits = world.balance.colorHits;
    tasterStruck(world, shot(world, t.col, "cyan", true));
    expect(world.balance.colorHits).toBe(hits);
  });
});

describe("two devices", () => {
  it("fingerprint the same fight identically, beat for beat", () => {
    const a = open(7);
    const b = open(7);
    for (let i = 0; i < 40; i++) {
      step(a, []);
      step(b, []);
      if (i % 9 === 0) {
        tasterStruck(a, shot(a, fan(a).col + 5, "cyan"));
        tasterStruck(b, shot(b, fan(b).col + 5, "cyan"));
      }
      expect(hashWorld(a)).toBe(hashWorld(b));
    }
  });

  it("fingerprint a fan fed one colour differently from one fed the other", () => {
    const a = open(7);
    const b = open(7);
    spend(a, 4, "red");
    spend(b, 4, "cyan");
    beats(a, CFG.tasterGrowBeats + 1);
    beats(b, CFG.tasterGrowBeats + 1);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
