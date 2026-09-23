import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { type LedgerState, ledgerBoss, ledgerPhase } from "../src/ledger.js";
import { ledgerHandsHeard } from "../src/ledger-hand.js";
import { stepLedger } from "../src/ledger-step.js";
import type { Command, DragTarget } from "../src/types.js";
import { NOT_FAILED } from "../src/wave-fail.js";

/**
 * **THE LEDGER's four hands**, one per movement (`sim/ledger-hand.ts`).
 *
 * The rule the cord is built on is proved next door in `ledger.test.ts`; this
 * file only ever asks what a *hand* does to it — who may send each one, which
 * movement hears it at all, what it buys and what it costs. The cord's state
 * is set rather than played into, for that file's own reason: the seam, the
 * cadence and the walk have their own checks, and re-playing them here would
 * make this file slow at proving something it is not about.
 *
 * The one to read first is the plug. It is the only answer this fight has ever
 * had to a column nobody could reach in time, and every line of what it costs
 * is here: it is rationed, it wards nothing, and the movement it must not
 * reach is the one the whole encounter is built toward.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3): { world: World; t: LedgerState } {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "ledger" });
  const t = ledgerBoss(world);
  if (t === null) throw new Error("no cord installed");
  return { world, t };
}

/** Past the cord paying out, which is the only clock this fight has. */
function rooted(seed = 3): { world: World; t: LedgerState } {
  const s = open(seed);
  s.t.rootBeat = s.world.beat - CFG.ledgerRootBeats;
  return s;
}

function drag(target: DragTarget, on: boolean, extra: Partial<Command> = {}): Command {
  return { kind: "drag", target, on, fromMilli: 0, ...extra } as Command;
}

/** One return standing in the socket this beat, and the beat resolved. */
function lands(world: World, t: LedgerState, last = false): void {
  t.beads = [{ beat: world.beat, span: CFG.ledgerCadenceBeats, last, pulled: false }];
  stepLedger(world, t);
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

describe("the foot", () => {
  it("walks the cord along the plating while it is still paying out", () => {
    const { world, t } = open();
    const from = t.socket;
    expect(ledgerPhase(t, CFG, world.beat)).toBe("rooting");
    ledgerHandsHeard(world, 2, drag("ledgerFoot", true, { fromMilli: -2000 }));
    expect(t.socket).toBe(from - 2);
    expect(world.events.some((e) => e.type === "ledgerFoot")).toBe(true);
  });

  it("reads every move against the column it was grabbed in, not the last one", () => {
    const { world, t } = open();
    const from = t.socket;
    ledgerHandsHeard(world, 2, drag("ledgerFoot", true, { fromMilli: 1000 }));
    ledgerHandsHeard(world, 2, drag("ledgerFoot", true, { fromMilli: 2000 }));
    // Two tiles from the grab, not three: a carry is cumulative, so a move
    // that was coalesced away heals itself on the next one.
    expect(t.socket).toBe(from + 2);
  });

  it("aims the walk at the far wall from wherever she leaves it", () => {
    const { world, t } = open();
    ledgerHandsHeard(world, 2, drag("ledgerFoot", true, { fromMilli: 9000 }));
    expect(t.socket).toBe(CFG.cols - 1);
    // Against the right wall the first return has to walk left, or it is
    // asked for off the field.
    expect(t.walk).toBe(-1);
  });

  it("is not heard once the cord is in, nor from the pilot's thumb", () => {
    const { world, t } = rooted();
    const from = t.socket;
    ledgerHandsHeard(world, 2, drag("ledgerFoot", true, { fromMilli: 2000 }));
    expect(t.socket).toBe(from);
    const fresh = open();
    ledgerHandsHeard(fresh.world, 1, drag("ledgerFoot", true, { fromMilli: 2000 }));
    expect(fresh.t.socket).toBe(fresh.t.socket);
    expect(fresh.world.events.some((e) => e.type === "ledgerFoot")).toBe(false);
  });
});

describe("the plug", () => {
  it("rolls a return back onto the cord instead of warding it", () => {
    const { world, t } = rooted();
    ledgerHandsHeard(world, 2, drag("ledgerSocket", true));
    expect(t.plug).toBe(true);
    lands(world, t);
    // The bill is still owed, on the cadence the seam has now.
    expect(t.beads).toHaveLength(1);
    expect(t.beads[0]?.beat).toBe(world.beat + CFG.ledgerCadenceBeats);
    expect(t.rolled).toBe(1);
    // And none of it is a ward: the pair moved the problem, and the sheet
    // says so.
    expect(t.warded).toBe(0);
    expect(world.guard.deflected).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
    expect(world.events.some((e) => e.type === "ledgerRoll")).toBe(true);
  });

  it("walks the root under the rolled return, as every landing does", () => {
    const { world, t } = rooted();
    const from = t.socket;
    ledgerHandsHeard(world, 2, drag("ledgerSocket", true));
    lands(world, t);
    expect(t.socket).not.toBe(from);
  });

  it("is rationed by the beat, and the socket spits the thumb out at nought", () => {
    const { world, t } = rooted();
    ledgerHandsHeard(world, 2, drag("ledgerSocket", true));
    expect(t.plugBeats).toBe(CFG.ledgerPlugBeats);
    beats(world, 1);
    expect(t.plugBeats).toBe(CFG.ledgerPlugBeats - 1);
    beats(world, CFG.ledgerPlugBeats);
    expect(t.plugBeats).toBeLessThanOrEqual(0);
    expect(t.plug).toBe(false);
    // And it will not take a thumb again for the rest of the fight.
    ledgerHandsHeard(world, 2, drag("ledgerSocket", true));
    expect(t.plug).toBe(false);
  });

  it("is not heard while the cord is rooting, nor from the pilot", () => {
    const { world, t } = open();
    ledgerHandsHeard(world, 2, drag("ledgerSocket", true));
    expect(t.plug).toBe(false);
    const late = rooted();
    ledgerHandsHeard(late.world, 1, drag("ledgerSocket", true));
    expect(late.t.plug).toBe(false);
  });

  it("cannot be put in for the last return, which is the one they must let through", () => {
    const { world, t } = rooted();
    t.seam = CFG.ledgerSeamHits;
    expect(ledgerPhase(t, CFG, world.beat)).toBe("taut");
    ledgerHandsHeard(world, 2, drag("ledgerSocket", true));
    expect(t.plug).toBe(false);
  });

  it("does not roll the last return over even with the thumb already in", () => {
    const { world, t } = rooted();
    t.seam = CFG.ledgerWhipSeam;
    ledgerHandsHeard(world, 2, drag("ledgerSocket", true));
    t.seam = CFG.ledgerSeamHits;
    lands(world, t, true);
    // The cord tore out: the plug never reached the bead the fight ends on.
    expect(t.outBeat).toBeGreaterThanOrEqual(0);
    expect(t.rolled).toBe(0);
  });
});

describe("the pull", () => {
  /** The cord whipping, with one return four beats out. */
  function whipping(): { world: World; t: LedgerState } {
    const { world, t } = rooted();
    t.seam = CFG.ledgerWhipSeam;
    t.beads = [{ beat: world.beat + 4, span: 4, last: false, pulled: false }];
    expect(ledgerPhase(t, CFG, world.beat)).toBe("whipping");
    return { world, t };
  }

  it("hauls the soonest return a beat down the cord", () => {
    const { world, t } = whipping();
    ledgerHandsHeard(world, 1, drag("ledgerBead", true));
    expect(t.beads[0]?.beat).toBe(world.beat + 3);
    expect(t.beads[0]?.pulled).toBe(true);
    expect(world.events.some((e) => e.type === "ledgerPull")).toBe(true);
  });

  it("only ever hauls one once, however long the thumb stays on it", () => {
    const { world, t } = whipping();
    for (let i = 0; i < 4; i++) ledgerHandsHeard(world, 1, drag("ledgerBead", true));
    expect(t.beads[0]?.beat).toBe(world.beat + 3);
  });

  it("hauls the soonest, so it never lands on a beat another return holds", () => {
    // The root slides between two landings, so two bills on one beat would put
    // the second in a column the plate has just been walked out of. Nothing
    // refuses it: the soonest hauled a beat down is earlier than all the rest.
    const { world, t } = whipping();
    t.beads.push({ beat: world.beat + 3, span: 4, last: false, pulled: false });
    t.beads.push({ beat: world.beat + 5, span: 4, last: false, pulled: false });
    ledgerHandsHeard(world, 1, drag("ledgerBead", true));
    expect(t.beads.map((b) => b.beat - world.beat)).toEqual([4, 2, 5]);
    expect(new Set(t.beads.map((b) => b.beat)).size).toBe(t.beads.length);
  });

  it("is not heard while the cord is only paying, nor from the navigator", () => {
    const { world, t } = whipping();
    t.seam = 0;
    ledgerHandsHeard(world, 1, drag("ledgerBead", true));
    expect(t.beads[0]?.beat).toBe(world.beat + 4);
    t.seam = CFG.ledgerWhipSeam;
    ledgerHandsHeard(world, 2, drag("ledgerBead", true));
    expect(t.beads[0]?.beat).toBe(world.beat + 4);
  });

  it("leaves the last return alone", () => {
    const { world, t } = whipping();
    t.beads = [{ beat: world.beat + 4, span: 4, last: true, pulled: false }];
    ledgerHandsHeard(world, 1, drag("ledgerBead", true));
    expect(t.beads[0]?.beat).toBe(world.beat + 4);
  });
});

describe("the haul", () => {
  /** The cord taut, with the last return on it and the plate elsewhere. */
  function taut(): { world: World; t: LedgerState } {
    const { world, t } = rooted();
    t.seam = CFG.ledgerSeamHits;
    t.beads = [{ beat: world.beat + 3, span: 3, last: true, pulled: false }];
    world.shieldCol = (t.socket + 2) % CFG.cols;
    return { world, t };
  }

  it("tears the cord out by hand once it has come far enough", () => {
    const { world, t } = taut();
    ledgerHandsHeard(world, 1, drag("ledgerCord", true, { fromYMilli: CFG.ledgerHaulMilli }));
    expect(t.outBeat).toBe(world.beat);
    expect(t.beads).toHaveLength(0);
    expect(world.failTick).toBe(NOT_FAILED);
    expect(world.events.some((e) => e.type === "ledgerHaul")).toBe(true);
    expect(world.events.some((e) => e.type === "ledgerTear")).toBe(true);
  });

  it("holds the depth while it is short of it, so the picture has something to draw", () => {
    const { world, t } = taut();
    ledgerHandsHeard(world, 1, drag("ledgerCord", true, { fromYMilli: 800 }));
    expect(t.haulMilli).toBe(800);
    expect(t.outBeat).toBe(-1);
    ledgerHandsHeard(world, 1, drag("ledgerCord", false, { fromYMilli: 0 }));
    expect(t.haulMilli).toBe(0);
  });

  it("will not come while the plate is still in the socket's column", () => {
    const { world, t } = taut();
    world.shieldCol = t.socket;
    ledgerHandsHeard(world, 1, drag("ledgerCord", true, { fromYMilli: CFG.ledgerHaulMilli }));
    expect(t.outBeat).toBe(-1);
    expect(t.haulMilli).toBe(0);
    // She carries it out, and the same carry finishes the fight.
    world.shieldCol = (t.socket + 1) % CFG.cols;
    ledgerHandsHeard(world, 1, drag("ledgerCord", true, { fromYMilli: CFG.ledgerHaulMilli }));
    expect(t.outBeat).toBe(world.beat);
  });

  it("is not heard before the cord is taut, nor from the navigator", () => {
    const { world, t } = taut();
    t.seam = CFG.ledgerWhipSeam;
    ledgerHandsHeard(world, 1, drag("ledgerCord", true, { fromYMilli: CFG.ledgerHaulMilli }));
    expect(t.outBeat).toBe(-1);
    t.seam = CFG.ledgerSeamHits;
    ledgerHandsHeard(world, 2, drag("ledgerCord", true, { fromYMilli: CFG.ledgerHaulMilli }));
    expect(t.outBeat).toBe(-1);
  });
});

describe("two devices", () => {
  it("fingerprint a walked foot differently from a cord left where it went in", () => {
    const a = open(7);
    const b = open(7);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
    ledgerHandsHeard(a.world, 2, drag("ledgerFoot", true, { fromMilli: 2000 }));
    expect(hashWorld(a.world)).not.toBe(hashWorld(b.world));
  });

  it("fingerprint a plugged socket differently from an open one", () => {
    const a = rooted(7);
    const b = rooted(7);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
    ledgerHandsHeard(a.world, 2, drag("ledgerSocket", true));
    expect(hashWorld(a.world)).not.toBe(hashWorld(b.world));
  });

  it("fingerprint a hauled return differently from one left on its own count", () => {
    const a = rooted(7);
    const b = rooted(7);
    for (const s of [a, b]) {
      s.t.seam = CFG.ledgerWhipSeam;
      s.t.beads = [{ beat: s.world.beat + 4, span: 4, last: false, pulled: false }];
    }
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
    ledgerHandsHeard(a.world, 1, drag("ledgerBead", true));
    expect(hashWorld(a.world)).not.toBe(hashWorld(b.world));
  });
});
