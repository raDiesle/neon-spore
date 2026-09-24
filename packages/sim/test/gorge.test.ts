import { describe, expect, it } from "bun:test";
import { gorgeStruck, installGorge } from "../src/gorge-step.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GorgeState,
  gorgeBeads,
  gorgeBoss,
  gorgeFull,
  gorgeNearestFull,
  gorgePhase,
  gorgeSink,
  hashWorld,
  midCol,
  type SimConfig,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE GORGE, and the sentence it is built to make true: **the one boss you
 * hurt by not shooting.** Every shot that leaves the top of the field under
 * it is swallowed as a bead; four beads fill an intake and the next two shots
 * rupture it, but a full intake left alone vents a torch, and every bead the
 * pair throws in comes back at them once the sack starts spitting. What is
 * checked here is the rule and nothing of the look — the sack, the beads and
 * the rupture are render's, and `gorgeSink` is the one number it asks for.
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

/** Run `n` beats, and say which of the boss's events went by. */
function beats(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** A shot that has just left through the top of `col`, handed to the boss the way `bullets.ts` does. */
function shot(world: World, col: number, color: Color = "red", lance = false): Bullet {
  return { id: world.nextId++, col, row: 0, subMilli: 0, color, lance, driftMilli: 0, aimMilli: 0 };
}

/** `n` shots of `color` up `col`. */
function feed(world: World, col: number, n: number, color: Color = "red"): void {
  for (let i = 0; i < n; i++) gorgeStruck(world, shot(world, col, color));
}

/** Fill intake `i` and pierce it. */
function pierce(world: World, i: number): void {
  const col = sack(world).col + i;
  feed(world, col, CFG.gorgeFullBeads + CFG.gorgeVentShots);
}

describe("the sack settling", () => {
  it("arrives centred, as wide as the field allows, with every intake empty", () => {
    const world = open();
    const g = sack(world);
    expect(g.intakes.length).toBe(Math.min(CFG.gorgeIntakes, CFG.cols));
    expect(g.col + Math.floor(g.intakes.length / 2)).toBe(midCol(CFG));
    expect(gorgeBeads(g)).toBe(0);
    expect(gorgePhase(g, CFG)).toBe("feeding");
    expect(world.events.some((e) => e.type === "gorgeSettle")).toBe(true);
  });

  it("swallows a shot in its column as a bead of that colour, and none outside it", () => {
    const world = open();
    const g = sack(world);
    gorgeStruck(world, shot(world, g.col + 2, "cyan"));
    expect(g.intakes[2]?.beads).toBe(1);
    expect(g.intakes[2]?.color).toBe("cyan");
    expect(world.balance.colorHits).toBe(1);
    gorgeStruck(world, shot(world, g.col - 1));
    gorgeStruck(world, shot(world, g.col + g.intakes.length));
    expect(gorgeBeads(g)).toBe(1);
  });

  it("lets a bead go for the wrong colour, and counts the miss", () => {
    const world = open();
    const g = sack(world);
    feed(world, g.col + 2, 2, "cyan");
    gorgeStruck(world, shot(world, g.col + 2, "red"));
    expect(g.intakes[2]?.beads).toBe(1);
    expect(g.intakes[2]?.color).toBe("cyan");
    expect(world.balance.colorMisses).toBe(1);
    gorgeStruck(world, shot(world, g.col + 2, "red"));
    expect(g.intakes[2]?.color).toBeNull();
    expect(world.events.filter((e) => e.type === "gorgeEmptied").length).toBe(2);
  });
});

describe("full, pierced or vented", () => {
  it("is full at four beads, once, and holds no more", () => {
    const world = open();
    const g = sack(world);
    feed(world, g.col + 3, CFG.gorgeFullBeads);
    const k = g.intakes[3];
    expect(k && gorgeFull(k, CFG)).toBe(true);
    expect(gorgeNearestFull(g)).toBe(3);
    expect(world.events.filter((e) => e.type === "gorgeFull").length).toBe(1);
    expect(gorgeSink(g, CFG)).toBe(Math.floor(CFG.gorgeFullBeads / CFG.gorgeSinkPer));
  });

  it("ruptures a full intake on its second shot of any colour, and a shot then passes through", () => {
    const world = open();
    const g = sack(world);
    feed(world, g.col + 3, CFG.gorgeFullBeads);
    gorgeStruck(world, shot(world, g.col + 3, "cyan"));
    expect(g.intakes[3]?.ruptured).toBe(false);
    expect(g.intakes[3]?.pierced).toBe(1);
    expect(g.intakes[3]?.beads).toBe(CFG.gorgeFullBeads);
    gorgeStruck(world, shot(world, g.col + 3, "red"));
    expect(g.intakes[3]?.ruptured).toBe(true);
    expect(g.ruptures).toBe(1);
    expect(world.events.some((e) => e.type === "gorgeRupture")).toBe(true);
    gorgeStruck(world, shot(world, g.col + 3));
    expect(g.intakes[3]?.beads).toBe(0);
    expect(gorgeBeads(g)).toBe(0);
  });

  it("vents a torch down the column of a full intake nobody pierced", () => {
    const world = open();
    const g = sack(world);
    feed(world, g.col + 1, CFG.gorgeFullBeads);
    // One shot of the two, and the count runs on regardless.
    gorgeStruck(world, shot(world, g.col + 1));
    beats(world, CFG.gorgeVentBeats - 1);
    expect(g.intakes[1]?.beads).toBe(CFG.gorgeFullBeads);
    const seen = beats(world, 2);
    expect(seen.has("gorgeVent")).toBe(true);
    expect(g.intakes[1]?.beads).toBe(0);
    expect(g.intakes[1]?.color).toBeNull();
    expect(g.intakes[1]?.pierced).toBe(0);
    expect(world.creatures.some((c) => c.kind === "torch" && c.col === g.col + 1)).toBe(true);
  });
});

describe("THE SLOW", () => {
  it("opens on the full intake for the vent's window, and shuts on the rupture", () => {
    const world = open();
    const g = sack(world);
    feed(world, g.col + 3, CFG.gorgeFullBeads);
    expect(world.slowToBeat).toBe(world.beat + CFG.gorgeVentBeats);
    feed(world, g.col + 3, CFG.gorgeVentShots);
    expect(world.slowToBeat).toBe(world.beat);
  });

  it("shuts on the vent, and stays up while a second intake still waits", () => {
    const world = open();
    const g = sack(world);
    feed(world, g.col + 1, CFG.gorgeFullBeads);
    beats(world, 2);
    feed(world, g.col + 5, CFG.gorgeFullBeads);
    const second = world.beat + CFG.gorgeVentBeats;
    expect(world.slowToBeat).toBe(second);
    feed(world, g.col + 5, CFG.gorgeVentShots);
    expect(world.slowToBeat).toBe(world.beat + CFG.gorgeVentBeats - 2);
    const seen = beats(world, CFG.gorgeVentBeats);
    expect(seen.has("gorgeVent")).toBe(true);
    expect(world.slowToBeat).toBeLessThanOrEqual(world.beat);
  });
});

describe("spitting", () => {
  it("returns nothing before two ruptures, then a bead from the emptiest intake as a body of its colour", () => {
    const world = open();
    const g = sack(world);
    feed(world, g.col + 0, 3, "red");
    feed(world, g.col + 6, 1, "cyan");
    pierce(world, 3);
    expect(beats(world, CFG.gorgeSpitBeats + 1).has("gorgeSpit")).toBe(false);
    pierce(world, 2);
    expect(gorgePhase(g, CFG)).toBe("spitting");
    // The count was already up: the first spit is on the next beat.
    const seen = beats(world, 1);
    expect(seen.has("gorgeSpit")).toBe(true);
    expect(g.intakes[6]?.beads).toBe(0);
    expect(g.intakes[0]?.beads).toBe(3);
    expect(world.creatures.some((c) => c.kind === "bulb" && c.col === g.col + 6)).toBe(true);
    // Then one bead every count, from what is left.
    beats(world, CFG.gorgeSpitBeats);
    expect(g.intakes[0]?.beads).toBe(2);
    expect(world.creatures.some((c) => c.kind === "slick" && c.col === g.col)).toBe(true);
  });
});

describe("the mouth", () => {
  function gorged(seed = 3): World {
    const world = open(seed);
    for (const i of [0, 1, 5, 6]) pierce(world, i);
    return world;
  }

  it("opens at four ruptures in the whole intake nearest the centre, and feeds itself", () => {
    const world = gorged();
    const g = sack(world);
    expect(gorgePhase(g, CFG)).toBe("gorged");
    expect(g.mouth).toBe(3);
    expect(world.events.some((e) => e.type === "gorgeMouth")).toBe(true);
    const color = g.intakes[3]?.color;
    expect(color === "red" || color === "cyan").toBe(true);
    beats(world, CFG.gorgeSpitBeats * CFG.gorgeFullBeads + 1);
    expect(g.intakes[3]?.beads).toBe(CFG.gorgeFullBeads);
    // Full, and never vented: the window stays open, and asks nothing on a clock.
    expect(world.slowToBeat).toBeLessThanOrEqual(world.beat);
    beats(world, CFG.gorgeVentBeats + 1);
    expect(g.intakes[3]?.beads).toBe(CFG.gorgeFullBeads);
    expect(world.creatures.some((c) => c.kind === "torch" && c.col === g.col + 3)).toBe(false);
  });

  it("is never pierced by a bolt, and a wrong-colour beam only empties it a bead", () => {
    const world = gorged();
    const g = sack(world);
    beats(world, CFG.gorgeSpitBeats * CFG.gorgeFullBeads + 1);
    const color = g.intakes[3]?.color ?? "red";
    const other: Color = color === "red" ? "cyan" : "red";
    gorgeStruck(world, shot(world, g.col + 3, color));
    expect(g.intakes[3]?.ruptured).toBe(false);
    expect(g.outBeat).toBe(-1);
    gorgeStruck(world, shot(world, g.col + 3, other, true));
    expect(g.intakes[3]?.beads).toBe(CFG.gorgeFullBeads - 1);
    expect(g.outBeat).toBe(-1);
  });

  it("ends on two beams in its colour while full and pried, and holds the wave before the boss goes", () => {
    const world = gorged();
    const g = sack(world);
    beats(world, CFG.gorgeSpitBeats * CFG.gorgeFullBeads + 1);
    const color = g.intakes[3]?.color ?? "red";
    // The pry is the navigator's thumb on the mouth (`gorge-hand.test.ts`).
    g.pry = 3;
    g.pryBeat = world.beat;
    gorgeStruck(world, shot(world, g.col + 3, color, true));
    expect(gorgePhase(g, CFG)).toBe("gorged");
    expect(g.pryFills).toBe(1);
    gorgeStruck(world, shot(world, g.col + 3, color, true));
    expect(gorgePhase(g, CFG)).toBe("out");
    expect(world.events.some((e) => e.type === "gorgeOut")).toBe(true);
    // A shot into the sack now is nothing.
    gorgeStruck(world, shot(world, g.col + 3, color));
    expect(g.intakes[3]?.beads).toBe(CFG.gorgeFullBeads);
    beats(world, CFG.gorgeOutBeats - 1);
    expect(world.boss).not.toBeNull();
    beats(world, 2);
    expect(world.boss).toBeNull();
  });
});

describe("the wave and the fingerprint", () => {
  it("holds the wave open while it hangs there, with nothing else on the field", () => {
    const world = open();
    beats(world, 12);
    expect(world.boss).not.toBeNull();
    expect(world.events.some((e) => e.type === "needWave")).toBe(false);
    expect(world.creatures.length).toBe(0);
  });

  it("fingerprints the same run the same way twice", () => {
    const run = (): number => {
      const world = open(11);
      pierce(world, 1);
      feed(world, sack(world).col + 4, 2, "cyan");
      pierce(world, 5);
      beats(world, 9);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });

  it("installs from a world with the wave's own beat", () => {
    const world = createWorld(CFG, 1);
    const g = installGorge(world);
    expect(g.spitBeat).toBe(world.beat);
    expect(g.mouth).toBe(-1);
  });
});
