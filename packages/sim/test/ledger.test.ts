import { describe, expect, it } from "bun:test";
import { bossHoldsWave } from "../src/boss-kinds.js";
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
// The cord's own readers, from the files rather than the package surface: what
// leaves `packages/sim` for this boss today is its entry and nothing else, and
// the lane that draws it is the one that will need the rest (`bosses.ts`).
import {
  type LedgerState,
  ledgerBoss,
  ledgerCadence,
  ledgerCovers,
  ledgerLetThrough,
  ledgerNext,
  ledgerPhase,
  ledgerSeamCol,
  ledgerWhips,
} from "../src/ledger.js";
import { ledgerBills, ledgerStruck } from "../src/ledger-shot.js";
import { stepLedger } from "../src/ledger-step.js";
import type { Bullet, Color } from "../src/types.js";
import { NOT_FAILED } from "../src/wave-fail.js";

/**
 * THE LEDGER, and the sentence it is built to make true: **every hit you land
 * comes back at your own hull.** A bolt up the seam widens it and starts a
 * return down the cord, and the return is warded in the socket's column
 * exactly the way a rock is — so most of what is checked here is *whose body
 * takes it*, and on which beat.
 *
 * Three of the checks are the three places the design had to be argued with
 * rather than followed, and they are the ones to read first: a return nobody
 * answered loses the wave like every other hull hit in this game, the cadence
 * shortens per **hit** rather than per miss, and the last return is the one the
 * pair is asked to let through (`docs/spec/bosses.md` §11.27).
 *
 * Nothing of the look is checked: the body, the seam and the bead coming down
 * are render's, and this file only ever asks what the rule says.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "ledger" });
  return world;
}

function cord(world: World): LedgerState {
  const t = ledgerBoss(world);
  if (t === null) throw new Error("no cord installed");
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

/** Past the cord paying out, which is the only clock this fight has. */
function rooted(seed = 3): { world: World; t: LedgerState } {
  const world = open(seed);
  const t = cord(world);
  t.rootBeat = world.beat - CFG.ledgerRootBeats;
  return { world, t };
}

/** A shot that has just left through the top of `col`, the way `bullets.ts` hands one over. */
function shot(world: World, col: number, color: Color, lance = false): Bullet {
  return { id: world.nextId++, col, row: 0, subMilli: 0, color, lance, driftMilli: 0, aimMilli: 0 };
}

/** One return standing in the socket this beat: the state, not the wait. */
function arriving(world: World, t: LedgerState, last = false): void {
  t.beads = [{ beat: world.beat, span: CFG.ledgerCadenceBeats, last }];
}

/** The plate in the socket's column with the trigger inside its window. */
function answer(world: World, t: LedgerState): void {
  world.shieldCol = t.socket;
  world.guardTick = world.tick;
}

/** Hands off it: the plate carried out of the column and nothing pressed. */
function letGo(world: World, t: LedgerState): void {
  world.shieldCol = (t.socket + 2) % CFG.cols;
  world.guardTick = -1000;
}

describe("the cord going in", () => {
  it("stands a body over the middle of the field with the cord in the hull", () => {
    const world = open();
    const t = cord(world);
    const width = Math.min(CFG.ledgerCols, CFG.cols);
    expect(t.col + Math.floor(width / 2)).toBe(midCol(CFG));
    expect(ledgerSeamCol(t, CFG)).toBe(midCol(CFG));
    expect(ledgerCovers(t, CFG, t.col)).toBe(true);
    expect(ledgerCovers(t, CFG, t.col + width)).toBe(false);
    expect(t.socket).toBe(midCol(CFG));
    expect(t.seam).toBe(0);
    expect(t.warded).toBe(0);
    expect(t.beads).toEqual([]);
    expect(ledgerNext(t)).toBeNull();
    expect(t.outBeat).toBe(-1);
    expect(world.events.some((e) => e.type === "ledgerRoot")).toBe(true);
  });

  it("is a fixture that holds its wave and falls nothing of its own", () => {
    const world = open();
    expect(bossHoldsWave("ledger")).toBe(true);
    // Nothing the boss sends: the arrivals the pair chooses between are the
    // wave's own, and this one was started with none (`boss-kinds.ts`).
    beats(world, 6);
    expect(world.creatures.length).toBe(0);
    expect(ledgerBoss(world)).not.toBeNull();
  });

  it("cannot be hit at all while the cord is still paying out", () => {
    const world = open();
    const t = cord(world);
    expect(ledgerPhase(t, CFG, world.beat)).toBe("rooting");
    ledgerStruck(world, shot(world, ledgerSeamCol(t, CFG), t.want));
    expect(t.seam).toBe(0);
    expect(t.beads).toEqual([]);
    // A column miss, not a colour one: the cord has nothing rooted to bill.
    expect(world.balance.colorHits).toBe(0);
    expect(world.balance.colorMisses).toBe(0);
    expect(world.events.some((e) => e.type === "ledgerRefused")).toBe(true);
  });
});

describe("the seam", () => {
  it("widens on its own colour up its own column, and posts the bill", () => {
    const { world, t } = rooted();
    expect(ledgerPhase(t, CFG, world.beat)).toBe("paying");
    const want = t.want;
    ledgerStruck(world, shot(world, ledgerSeamCol(t, CFG), want));
    expect(t.seam).toBe(1);
    expect(world.balance.colorHits).toBe(1);
    expect(t.beads.length).toBe(1);
    const bead = ledgerNext(t);
    expect(bead?.last).toBe(false);
    expect(bead?.span).toBe(CFG.ledgerCadenceBeats - 1);
    expect(bead?.beat).toBe(world.beat + CFG.ledgerCadenceBeats - 1);
    const seam = world.events.find((e) => e.type === "ledgerSeam");
    expect(seam).toMatchObject({ col: ledgerSeamCol(t, CFG), seam: 1, color: t.want });
    expect(world.events.some((e) => e.type === "ledgerBead")).toBe(true);
  });

  it("refuses the plating either side of it at no cost in colour", () => {
    const { world, t } = rooted();
    const mid = ledgerSeamCol(t, CFG);
    ledgerStruck(world, shot(world, t.col, t.want));
    ledgerStruck(world, shot(world, mid + 1, t.want));
    expect(t.seam).toBe(0);
    expect(t.beads).toEqual([]);
    expect(world.balance.colorMisses).toBe(0);
    expect(world.events.filter((e) => e.type === "ledgerRefused").length).toBe(2);
  });

  it("counts the wrong colour up the right column as the colour miss it is", () => {
    const { world, t } = rooted();
    const other: Color = t.want === "red" ? "cyan" : "red";
    ledgerStruck(world, shot(world, ledgerSeamCol(t, CFG), other));
    expect(t.seam).toBe(0);
    expect(t.beads).toEqual([]);
    expect(world.balance.colorMisses).toBe(1);
    expect(world.events.some((e) => e.type === "ledgerRefused")).toBe(true);
  });

  it("takes nothing at all once the cord has torn out", () => {
    const { world, t } = rooted();
    t.outBeat = world.beat;
    ledgerStruck(world, shot(world, ledgerSeamCol(t, CFG), t.want));
    ledgerBills(world);
    expect(t.seam).toBe(0);
    expect(t.beads).toEqual([]);
    expect(world.events.some((e) => e.type === "ledgerRefused")).toBe(false);
  });

  it("shortens the cadence one beat per hit, and no further", () => {
    const { t } = rooted();
    t.seam = 0;
    expect(ledgerCadence(t, CFG)).toBe(CFG.ledgerCadenceBeats);
    t.seam = 1;
    expect(ledgerCadence(t, CFG)).toBe(CFG.ledgerCadenceBeats - 1);
    // The floor, and every hit after it: a miss cannot tighten anything in this
    // game, because a miss is a hit on the hull (`ledger.ts`).
    t.seam = CFG.ledgerSeamHits;
    expect(ledgerCadence(t, CFG)).toBe(CFG.ledgerCadenceMinBeats);
  });
});

describe("a return landing", () => {
  it("is warded by the plate in the socket with the trigger, and the wave holds", () => {
    const { world, t } = rooted();
    const socket = t.socket;
    arriving(world, t);
    answer(world, t);
    stepLedger(world, t);
    expect(t.warded).toBe(1);
    expect(world.guard.deflected).toBe(1);
    expect(world.guard.mistimed).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
    expect(t.beads).toEqual([]);
    expect(world.events.some((e) => e.type === "ledgerWard")).toBe(true);
    expect(world.events.some((e) => e.type === "breach")).toBe(false);
    expect(t.socket).not.toBe(socket);
  });

  it("holes the hull and loses the wave when nobody answered it", () => {
    const { world, t } = rooted();
    arriving(world, t);
    letGo(world, t);
    stepLedger(world, t);
    expect(world.guard.mistimed).toBe(1);
    expect(t.warded).toBe(0);
    expect(world.failTick).not.toBe(NOT_FAILED);
    expect(world.events.some((e) => e.type === "ledgerBill")).toBe(true);
    expect(world.events.some((e) => e.type === "waveFailed")).toBe(true);
  });

  it("is warded in the wrong column for nothing: the plate has to be in the socket", () => {
    const { world, t } = rooted();
    arriving(world, t);
    world.shieldCol = (t.socket + 1) % CFG.cols;
    world.guardTick = world.tick;
    stepLedger(world, t);
    expect(t.warded).toBe(0);
    expect(world.failTick).not.toBe(NOT_FAILED);
  });

  it("roots the cord a column further along the hull, and turns it at the wall", () => {
    const { world, t } = rooted();
    const step1 = CFG.ledgerSocketStep;
    t.socket = CFG.cols - 1 - step1;
    t.walk = 1;
    arriving(world, t);
    answer(world, t);
    stepLedger(world, t);
    expect(t.socket).toBe(CFG.cols - 1);
    expect(world.events.some((e) => e.type === "ledgerSocket")).toBe(true);
    // The wall: it turns rather than wrapping, because a cord that jumped the
    // width of the ship would be a column nobody could reach in two beats.
    arriving(world, t);
    answer(world, t);
    stepLedger(world, t);
    expect(t.walk).toBe(-1);
    expect(t.socket).toBe(CFG.cols - 1 - step1);
  });

  it("slows the beat as the soonest return takes its last one", () => {
    const { world, t } = rooted();
    t.beads = [{ beat: world.beat + 1, span: 3, last: false }];
    expect(slowing(world)).toBe(false);
    stepLedger(world, t);
    expect(slowing(world)).toBe(true);
  });
});

describe("the whip", () => {
  it("throws a warded return back up the cord and widens the seam, billing nothing", () => {
    const { world, t } = rooted();
    t.seam = CFG.ledgerWhipSeam;
    expect(ledgerWhips(t, CFG, world.beat)).toBe(true);
    expect(ledgerPhase(t, CFG, world.beat)).toBe("whipping");
    arriving(world, t);
    answer(world, t);
    stepLedger(world, t);
    expect(t.seam).toBe(CFG.ledgerWhipSeam + 1);
    expect(t.beads).toEqual([]);
    expect(world.events.some((e) => e.type === "ledgerWhip")).toBe(true);
  });

  it("bills every shot the cannon takes once it whips, and none before", () => {
    const { world, t } = rooted();
    ledgerBills(world);
    expect(t.beads).toEqual([]);
    t.seam = CFG.ledgerWhipSeam;
    ledgerBills(world);
    expect(t.beads.length).toBe(1);
    expect(t.beads[0]?.span).toBe(CFG.ledgerCadenceBeats - CFG.ledgerWhipSeam);
    expect(t.beads[0]?.last).toBe(false);
  });

  it("charges a hit that reaches the body once only, at the muzzle", () => {
    const { world, t } = rooted();
    t.seam = CFG.ledgerWhipSeam;
    ledgerStruck(world, shot(world, ledgerSeamCol(t, CFG), t.want));
    expect(t.seam).toBe(CFG.ledgerWhipSeam + 1);
    expect(t.beads).toEqual([]);
  });

  it("never doubles the last return with a bill for a shot taken under it", () => {
    const { world, t } = rooted();
    t.seam = CFG.ledgerSeamHits;
    expect(ledgerPhase(t, CFG, world.beat)).toBe("taut");
    ledgerBills(world);
    expect(t.beads).toEqual([]);
  });
});

describe("the last return", () => {
  function taut(seed = 3): { world: World; t: LedgerState } {
    const { world, t } = rooted(seed);
    t.seam = CFG.ledgerSeamHits - 1;
    ledgerStruck(world, shot(world, ledgerSeamCol(t, CFG), t.want));
    return { world, t };
  }

  it("is on the cord as soon as the seam is full, and is announced as itself", () => {
    const { world, t } = taut();
    expect(t.seam).toBe(CFG.ledgerSeamHits);
    expect(ledgerPhase(t, CFG, world.beat)).toBe("taut");
    expect(ledgerLetThrough(t)).toBe(true);
    expect(ledgerNext(t)?.last).toBe(true);
    expect(world.events.some((e) => e.type === "ledgerLast")).toBe(true);
  });

  it("tears the cord out of the ship when the pair takes their hands off it", () => {
    const { world, t } = taut();
    arriving(world, t, true);
    letGo(world, t);
    stepLedger(world, t);
    expect(t.outBeat).toBe(world.beat);
    expect(ledgerPhase(t, CFG, world.beat)).toBe("out");
    expect(t.beads).toEqual([]);
    // The payoff is not a hull hit: nothing broke the plating and the wave is
    // still live, which is the whole reason this return is theirs to let go.
    expect(world.failTick).toBe(NOT_FAILED);
    expect(world.events.some((e) => e.type === "ledgerTear")).toBe(true);
    expect(world.events.some((e) => e.type === "waveFailed")).toBe(false);
  });

  it("is refused when it is warded anyway, and comes down again a cadence later", () => {
    const { world, t } = taut();
    arriving(world, t, true);
    answer(world, t);
    const before = t.warded;
    stepLedger(world, t);
    expect(t.outBeat).toBe(-1);
    expect(t.warded).toBe(before);
    expect(t.beads.length).toBe(1);
    expect(t.beads[0]?.last).toBe(true);
    expect(t.beads[0]?.beat).toBe(world.beat + ledgerCadence(t, CFG));
    expect(world.failTick).toBe(NOT_FAILED);
    expect(world.events.some((e) => e.type === "ledgerHeld")).toBe(true);
    expect(world.events.some((e) => e.type === "ledgerTear")).toBe(false);
  });

  it("holds the wave while the halves part, then goes", () => {
    const { world, t } = taut();
    arriving(world, t, true);
    letGo(world, t);
    stepLedger(world, t);
    beats(world, CFG.ledgerOutBeats - 1);
    expect(ledgerBoss(world)).not.toBeNull();
    beats(world, 2);
    expect(ledgerBoss(world)).toBeNull();
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
        ledgerStruck(a, shot(a, ledgerSeamCol(cord(a), CFG), cord(a).want));
        ledgerStruck(b, shot(b, ledgerSeamCol(cord(b), CFG), cord(b).want));
      }
      expect(hashWorld(a)).toBe(hashWorld(b));
    }
  });

  it("fingerprint a return warded differently from one that was let through", () => {
    const a = rooted(7);
    const b = rooted(7);
    arriving(a.world, a.t);
    arriving(b.world, b.t);
    answer(a.world, a.t);
    stepLedger(a.world, a.t);
    b.t.beads = [];
    expect(hashWorld(a.world)).not.toBe(hashWorld(b.world));
  });
});
