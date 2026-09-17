import { describe, expect, it } from "bun:test";
import { NO_BEARING, TURN } from "../src/bearing.js";
import { DEFAULT_CONFIG, type SimConfig } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import {
  ORRERY_RINGS,
  type OrreryState,
  orreryBoss,
  orreryGapSlot,
  orreryNextOpen,
  orreryOrbit,
} from "../src/orrery.js";
import {
  NO_RING,
  orreryHandHolds,
  orreryHandRing,
  orreryRingHeard,
  orreryWoundMilli,
} from "../src/orrery-hand.js";
import { orreryBreak } from "../src/orrery-step.js";
import { step } from "../src/step.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * **The pilot's hand on a ring**, which is THE ORRERY's one physical control
 * and the only thing in the fight that can move a gap off a beat the pair has
 * already agreed on (`docs/spec/bosses-choreographed.md` §2 step 10, shipped
 * as `docs/spec/bosses.md` §11.21).
 *
 * What is checked here is the three claims that control is made of. That it
 * is a **bearing** — the first sample after a grab is a reference and turns
 * nothing, and a thumb that has come round past the top is read the short way
 * — which is THE CLAW's crank exactly (`crank.ts`). That it gives **whole
 * organs and nothing else**, so a turn shorter than a detent is banked rather
 * than lost and the picture never has to draw a gap between two slots. And
 * that it **writes the anchor**, so the arithmetic the whole boss is made of
 * survives a hand being laid on it: a ring the pilot has turned still comes
 * round on its own count, and what has changed is the beat it comes round
 * *on*.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const PER = CFG.orreryHandMilliPerOrgan;
const WAVE = 9;

function open(seed = 5): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "orrery" });
  return world;
}

function rings(world: World): OrreryState {
  const boss = orreryBoss(world);
  if (boss === null) throw new Error("no orrery installed");
  return boss;
}

function send(world: World, at: number, player: 1 | 2 = 1, on = true): void {
  orreryRingHeard(world, player, { kind: "drag", target: "orreryRing", on, fromMilli: at });
}

/** A thumb going on the ring: no reference, then the sample that becomes one. */
function grab(world: World, player: 1 | 2 = 1): void {
  send(world, NO_BEARING, player);
  send(world, 0, player);
}

/**
 * The thumb carried `milli` thousandths of a turn from wherever it is, in
 * samples of a quarter of a turn — well inside the half a bearing can be read
 * across, and about what a real finger reports between two ticks.
 */
function turn(world: World, milli: number, player: 1 | 2 = 1): void {
  const b = rings(world);
  let at = b.handAtMilli === NO_BEARING ? 0 : b.handAtMilli;
  let left = Math.abs(milli);
  const way = milli >= 0 ? 1 : -1;
  while (left > 0) {
    const chunk = Math.min(250, left);
    left -= chunk;
    at += way * chunk;
    send(world, ((at % TURN) + TURN) % TURN, player);
  }
}

describe("THE ORRERY's hand: which ring answers it", () => {
  it("is the outermost one still standing, and moves inward as they come off", () => {
    const world = open();
    const b = rings(world);
    expect(orreryHandRing(b)).toBe(0);
    orreryBreak(world, b);
    expect(orreryHandRing(b)).toBe(1);
    orreryBreak(world, b);
    expect(orreryHandRing(b)).toBe(2);
  });

  it("is nothing at all once every ring is off, and a turn then does nothing", () => {
    const world = open();
    const b = rings(world);
    for (let i = 0; i < ORRERY_RINGS; i++) orreryBreak(world, b);
    expect(orreryHandRing(b)).toBe(NO_RING);
    const was = [...b.from];
    grab(world);
    turn(world, PER * 2);
    expect(b.from).toEqual(was);
    // The bearing is still recorded, so a hand that is still down does not
    // turn anything by wherever it happened to be when the last ring broke.
    expect(b.handAtMilli).not.toBe(NO_BEARING);
    expect(orreryHandHolds(b)).toBe(false);
  });
});

describe("THE ORRERY's hand: a bearing, not a distance", () => {
  it("turns nothing on the first sample after a grab", () => {
    const world = open();
    const b = rings(world);
    const was = b.from[0];
    send(world, NO_BEARING);
    // Half a turn's worth of bearing, and it buys nothing: it says where the
    // thumb started, not how far it has come.
    send(world, 500);
    expect(b.from[0]).toBe(was);
    expect(orreryWoundMilli(b)).toBe(0);
  });

  it("forgets its reference when the hand lifts", () => {
    const world = open();
    const b = rings(world);
    grab(world);
    send(world, 0, 1, false);
    expect(b.handAtMilli).toBe(NO_BEARING);
    expect(orreryHandHolds(b)).toBe(false);
    const was = b.from[0];
    send(world, 400);
    expect(b.from[0]).toBe(was);
  });

  it("reads a thumb past the top the short way round", () => {
    const world = open();
    const b = rings(world);
    send(world, NO_BEARING);
    // 900 is the reference, and 100 after it is a fifth of a turn forward
    // rather than four fifths back — which is the whole reason a bearing needs
    // `MAX_BEARING_STEP`.
    send(world, 900);
    send(world, 100);
    expect(orreryWoundMilli(b)).toBe(200);
    // And the other way round it reads as backward, not as eight tenths on.
    send(world, 900);
    expect(orreryWoundMilli(b)).toBe(0);
  });

  it("banks a turn shorter than a detent and pays it when it is finished", () => {
    const world = open();
    const b = rings(world);
    const was = b.from[0] ?? 0;
    grab(world);
    turn(world, PER - 250);
    expect(b.from[0]).toBe(was);
    expect(orreryWoundMilli(b)).toBe(PER - 250);
    turn(world, 250);
    expect(b.from[0]).toBe((was + 1) % orreryOrbit(CFG, 0));
    expect(orreryWoundMilli(b)).toBe(0);
  });

  it("keeps the bank across a lift, and is not a flywheel", () => {
    const world = open();
    const b = rings(world);
    grab(world);
    turn(world, 500);
    send(world, 0, 1, false);
    expect(orreryWoundMilli(b)).toBe(500);
    const was = b.from[0];
    // Nothing moves a ring but a hand: a hundred beats of nobody touching it
    // leave the bank and the anchor exactly where they were.
    for (let i = 0; i < 400; i++) step(world, []);
    expect(orreryWoundMilli(b)).toBe(500);
    expect(rings(world).from[0]).toBe(was);
  });

  it("gives back exactly what it bought when the thumb turns the other way", () => {
    const world = open();
    const b = rings(world);
    const was = b.from[0];
    grab(world);
    turn(world, PER);
    expect(b.from[0]).not.toBe(was);
    turn(world, -PER);
    expect(b.from[0]).toBe(was);
    expect(orreryWoundMilli(b)).toBe(0);
  });

  it("is player 1's alone", () => {
    const world = open();
    const b = rings(world);
    const was = b.from[0];
    grab(world, 2);
    turn(world, PER * 2, 2);
    expect(b.from[0]).toBe(was);
    expect(b.handAtMilli).toBe(NO_BEARING);
  });
});

describe("THE ORRERY's hand: it writes the anchor", () => {
  it("leaves the ring turning on its own count", () => {
    const world = open();
    const b = rings(world);
    grab(world);
    turn(world, PER);
    const orbit = orreryOrbit(CFG, 0);
    for (let beat = 0; beat < 20; beat++) {
      expect(orreryGapSlot(CFG, b, 0, beat + orbit)).toBe(orreryGapSlot(CFG, b, 0, beat));
    }
  });

  it("moves that ring's gap and no other's", () => {
    const world = open();
    const b = rings(world);
    const before = [1, 2].map((r) => orreryGapSlot(CFG, b, r, 30));
    const was = orreryGapSlot(CFG, b, 0, 30);
    grab(world);
    turn(world, PER);
    expect(orreryGapSlot(CFG, b, 0, 30)).toBe((was + 1) % orreryOrbit(CFG, 0));
    expect([1, 2].map((r) => orreryGapSlot(CFG, b, r, 30))).toEqual(before);
  });

  it("brings the alignment forward: twelve beats off becomes this beat", () => {
    const world = open();
    const b = rings(world);
    expect(orreryNextOpen(CFG, b, b.anchorBeat, 40)).toBe(CFG.orreryFirstBeats);
    grab(world);
    // Four organs of the outer ring — six full turns of the thumb, which is
    // the price of it (`orreryHandMilliPerOrgan`).
    turn(world, PER * 4);
    expect(orreryNextOpen(CFG, b, b.anchorBeat, 40)).toBe(0);
  });

  it("can also throw an alignment away, which is what makes it a gesture", () => {
    const world = open();
    const b = rings(world);
    const near = orreryNextOpen(CFG, b, b.anchorBeat, 40);
    grab(world);
    turn(world, PER);
    expect(orreryNextOpen(CFG, b, b.anchorBeat, 40)).not.toBe(near);
  });

  it("loses whatever was banked against a ring that breaks", () => {
    const world = open();
    const b = rings(world);
    grab(world);
    turn(world, 500);
    expect(orreryWoundMilli(b)).toBe(500);
    orreryBreak(world, b);
    expect(orreryWoundMilli(b)).toBe(0);
  });
});

describe("THE ORRERY's hand: on the wire and on the tick", () => {
  it("reaches the boss through step, on the tick", () => {
    const world = open();
    const was = rings(world).from[0] ?? 0;
    const at = (n: number) => ({
      tick: world.tick,
      player: 1 as const,
      command: { kind: "drag", target: "orreryRing", on: true, fromMilli: n } as const,
    });
    step(world, [at(NO_BEARING)]);
    // One sample more than the detent costs: the first of them is the
    // reference and buys nothing.
    for (let i = 0; i <= PER / 250; i++) step(world, [at(((i + 1) * 250) % TURN)]);
    expect(rings(world).from[0]).toBe((was + 1) % orreryOrbit(CFG, 0));
  });

  it("is in the fingerprint, both halves of it", () => {
    const world = open();
    const plain = hashWorld(world);
    const turned = open();
    grab(turned);
    // Less than a detent: the anchors are identical and only the bank differs,
    // which is exactly the disagreement a hash over positions would have let
    // through.
    turn(turned, 250);
    expect(rings(turned).from).toEqual(rings(world).from);
    expect(hashWorld(turned)).not.toBe(plain);
  });
});
