import { describe, expect, it } from "bun:test";
import { gorgeHeard } from "../src/gorge-hand.js";
import { gorgeStruck } from "../src/gorge-step.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GorgeState,
  gorgeBoss,
  gorgeFull,
  gorgePhase,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE GORGE's two thumbs (`gorge-hand.ts`): player 1's **pinch** on a full
 * intake, which holds its vent off for as long as it stays and restarts the
 * count from the lift; and player 2's **pry** on the mouth, a window of
 * `gorgePryBeats` for `gorgePryFills` beams, without which the beam is clenched on and past which the
 * thumb is thrown off with a bead. One receipt per rule, the way
 * `diastole-clamp.test.ts` gives them.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "gorge" });
  return world;
}

function sack(world: World): GorgeState {
  const g = gorgeBoss(world);
  if (g === null) throw new Error("no sack installed");
  return g;
}

function beats(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

function shot(world: World, col: number, color: Color = "red", lance = false): Bullet {
  return { id: world.nextId++, col, row: 0, subMilli: 0, color, lance, driftMilli: 0, aimMilli: 0 };
}

function feed(world: World, col: number, n: number, color: Color = "red"): void {
  for (let i = 0; i < n; i++) gorgeStruck(world, shot(world, col, color));
}

function pierce(world: World, i: number): void {
  feed(world, sack(world).col + i, CFG.gorgeFullBeads + CFG.gorgeVentShots);
}

/** A thumb down or up on intake `id`, from `player`. */
function lobe(world: World, player: 1 | 2, id: number, on: boolean): void {
  gorgeHeard(world, player, {
    kind: "drag",
    target: "gorgeLobe",
    on,
    fromMilli: 0,
    fromYMilli: 0,
    id,
  });
}

/** Four ruptures in, the mouth open at intake 3 and fed full. */
function gorged(seed = 3): World {
  const world = open(seed);
  for (const i of [0, 1, 5, 6]) pierce(world, i);
  beats(world, CFG.gorgeSpitBeats * CFG.gorgeFullBeads + 1);
  return world;
}

function torched(world: World, col: number): boolean {
  return world.creatures.some((c) => c.kind === "torch" && c.col === col);
}

describe("the pinch", () => {
  it("holds a full intake from venting for as long as the thumb stays", () => {
    const world = open();
    const g = sack(world);
    feed(world, g.col + 2, CFG.gorgeFullBeads);
    lobe(world, 1, 2, true);
    expect(g.pinch).toBe(2);
    expect(world.events.some((e) => e.type === "gorgePinch")).toBe(true);
    const seen = beats(world, CFG.gorgeVentBeats * 3);
    expect(seen.has("gorgeVent")).toBe(false);
    expect(gorgeFull(g.intakes[2] as never, CFG)).toBe(true);
    expect(torched(world, g.col + 2)).toBe(false);
  });

  it("restarts the count from the lift: the vent comes gorgeVentBeats after the thumb goes", () => {
    const world = open();
    const g = sack(world);
    feed(world, g.col + 2, CFG.gorgeFullBeads);
    lobe(world, 1, 2, true);
    beats(world, CFG.gorgeVentBeats * 2);
    lobe(world, 1, 2, false);
    expect(g.pinch).toBe(-1);
    expect(beats(world, CFG.gorgeVentBeats - 1).has("gorgeVent")).toBe(false);
    expect(beats(world, 2).has("gorgeVent")).toBe(true);
    expect(torched(world, g.col + 2)).toBe(true);
  });

  it("is dropped on an intake that is not full, on the mouth, and from the other seat", () => {
    const world = open();
    const g = sack(world);
    feed(world, g.col + 2, CFG.gorgeFullBeads - 1);
    lobe(world, 1, 2, true);
    expect(g.pinch).toBe(-1);
    feed(world, g.col + 2, 1);
    lobe(world, 2, 2, true);
    expect(g.pinch).toBe(-1);
    expect(world.events.some((e) => e.type === "gorgePinch")).toBe(false);
    const world2 = gorged();
    lobe(world2, 1, 3, true);
    expect(sack(world2).pinch).toBe(-1);
  });

  it("goes with the rupture: the pierce lifts the thumb", () => {
    const world = open();
    const g = sack(world);
    feed(world, g.col + 2, CFG.gorgeFullBeads);
    lobe(world, 1, 2, true);
    feed(world, g.col + 2, CFG.gorgeVentShots - 1);
    expect(g.pinch).toBe(2);
    feed(world, g.col + 2, 1);
    expect(g.intakes[2]?.ruptured).toBe(true);
    expect(g.pinch).toBe(-1);
  });
});

describe("the pry", () => {
  it("gates the beam: unpried the mouth clenches on it, pried two of it end the fight", () => {
    const world = gorged();
    const g = sack(world);
    const color = g.intakes[3]?.color ?? "red";
    const hits = world.balance.colorHits;
    gorgeStruck(world, shot(world, g.col + 3, color, true));
    expect(g.outBeat).toBe(-1);
    expect(g.intakes[3]?.beads).toBe(CFG.gorgeFullBeads);
    expect(world.events.some((e) => e.type === "gorgeClench")).toBe(true);
    // Refused, not missed: the balance does not move either way.
    expect(world.balance.colorHits).toBe(hits);
    lobe(world, 2, 3, true);
    expect(g.pry).toBe(3);
    expect(world.events.some((e) => e.type === "gorgePry")).toBe(true);
    expect(world.slowToBeat).toBe(world.beat + CFG.gorgePryBeats);
    gorgeStruck(world, shot(world, g.col + 3, color, true));
    expect(g.pryFills).toBe(1);
    expect(gorgePhase(g, CFG)).toBe("gorged");
    gorgeStruck(world, shot(world, g.col + 3, color, true));
    expect(gorgePhase(g, CFG)).toBe("out");
    expect(world.slowToBeat).toBe(world.beat);
  });

  it("is thrown off past gorgePryBeats: a clench, one bead spat, and a lift owed", () => {
    const world = gorged();
    const g = sack(world);
    const color = g.intakes[3]?.color ?? "red";
    lobe(world, 2, 3, true);
    // One fill of the two, and the window runs out on it all the same.
    gorgeStruck(world, shot(world, g.col + 3, color, true));
    expect(beats(world, CFG.gorgePryBeats - 1).has("gorgeClench")).toBe(false);
    expect(g.pry).toBe(3);
    const seen = beats(world, 2);
    expect(seen.has("gorgeClench")).toBe(true);
    expect(seen.has("gorgeSpit")).toBe(true);
    expect(g.pry).toBe(-1);
    expect(g.pryFills).toBe(0);
    expect(world.slowToBeat).toBeLessThanOrEqual(world.beat);
    expect(g.intakes[3]?.beads).toBe(CFG.gorgeFullBeads - 1);
    expect(world.creatures.some((c) => c.col === g.col + 3)).toBe(true);
    // The thumb still down is not a pry: it has to come down again.
    beats(world, CFG.gorgeSpitBeats + 1);
    expect(g.intakes[3]?.beads).toBe(CFG.gorgeFullBeads);
    gorgeStruck(world, shot(world, g.col + 3, color, true));
    expect(g.outBeat).toBe(-1);
    lobe(world, 2, 3, true);
    gorgeStruck(world, shot(world, g.col + 3, color, true));
    gorgeStruck(world, shot(world, g.col + 3, color, true));
    expect(gorgePhase(g, CFG)).toBe("out");
  });

  it("lifted inside the window costs nothing, and the mouth goes on feeding under it", () => {
    const world = gorged();
    const g = sack(world);
    const color = g.intakes[3]?.color ?? "red";
    gorgeStruck(world, shot(world, g.col + 3, color === "red" ? "cyan" : "red", true));
    expect(g.intakes[3]?.beads).toBe(CFG.gorgeFullBeads - 1);
    lobe(world, 2, 3, true);
    // Inside the window, and long enough for the mouth's count to come round.
    const seen = beats(world, CFG.gorgePryBeats - 1);
    expect(seen.has("gorgeSpit")).toBe(false);
    expect(g.intakes[3]?.beads).toBe(CFG.gorgeFullBeads);
    lobe(world, 2, 3, false);
    expect(g.pry).toBe(-1);
    expect(beats(world, CFG.gorgePryBeats + 1).has("gorgeClench")).toBe(false);
  });

  it("is dropped before there is a mouth, on any other intake, and from the pilot", () => {
    const world = open();
    lobe(world, 2, 3, true);
    expect(sack(world).pry).toBe(-1);
    const world2 = gorged();
    lobe(world2, 2, 2, true);
    lobe(world2, 1, 3, true);
    expect(sack(world2).pry).toBe(-1);
    expect(world2.events.some((e) => e.type === "gorgePry")).toBe(false);
  });
});

describe("the fingerprint", () => {
  it("carries both thumbs", () => {
    const a = gorged();
    const b = gorged();
    expect(hashWorld(a)).toBe(hashWorld(b));
    lobe(b, 2, 3, true);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
    const c = open();
    const d = open();
    feed(c, sack(c).col + 2, CFG.gorgeFullBeads);
    feed(d, sack(d).col + 2, CFG.gorgeFullBeads);
    lobe(d, 1, 2, true);
    expect(hashWorld(c)).not.toBe(hashWorld(d));
  });
});
