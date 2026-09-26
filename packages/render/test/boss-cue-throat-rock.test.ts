import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type Creature, type ThroatState, throatMouthRow, type World } from "@neon-spore/sim";
import { throatTubeCircle } from "../src/throat-grip.js";
import { rings } from "../src/throat-shape.js";
import { cue, LAYOUT, mouthCol, opened, put, word } from "./boss-cue-throat-rig.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE THROAT's rocks**: one standing in the mouth, and one climbing the
 * gullet under it — the two moments no shot answers and a hand does. The gum
 * and the body in the mouth are `boss-cue-throat.test.ts`, which has why the
 * states are set rather than played into; this is that file's second half,
 * cut off on 26 September 2026 when it was 345 lines.
 */

beforeAll(installCanvasGlobals);

/**
 * **The rock standing in the mouth, which a shot cannot answer** — the hole
 * the gullet's own two handles fill (`throat-hand.ts`). A bolt at a warded
 * body leaves a crater and not a kill, and the hand that would drag at its
 * fall has nothing left to drag at: until 19 September 2026 the honest answer
 * was silence, and now the answer is the phase.
 */
describe("a rock the mouth already has", () => {
  /** The fight put in a phase, with a rock standing in the mouth of it. */
  function warded(phase: ThroatState["phase"], slack: number) {
    const { world, t } = opened();
    t.slack = slack;
    t.phase = phase;
    t.phaseBeat = world.beat;
    world.cannonCol = mouthCol(world, t);
    put(world, "meteor", mouthCol(world, t), throatMouthRow(CFG));
    return { world, t };
  }

  it("asks the navigator to pinch a slack ring while the mouth is still travelling", () => {
    // The cinch stops the inhale and never the mouth, so in a phase with a
    // stride the frozen beats are the mouth sliding off the body.
    const { world } = warded("slide", 1);
    expect(word(world, "p2")).toBe("CINCH");
    expect(cue(world, "p2")?.kind).toBe("HOLD");
    expect(cue(world, "p2")?.seat).toBe(2);
    // Not his: there is one thumb on the ring and it is hers (`ringHeard`).
    expect(word(world, "p1")).toBeNull();
  });

  it("stands the pinch on the lowest ring, which is the slack one", () => {
    const { world, t } = warded("quick", 2);
    const l = LAYOUT.p2;
    const low = rings(l, CFG, t, world.beat, 0)[CFG.throatRings - 1];
    expect(Math.abs((cue(world, "p2")?.x ?? 0) - (low?.x ?? -999))).toBeLessThan(1);
    expect(Math.abs((cue(world, "p2")?.y ?? 0) - (low?.y ?? -999))).toBeLessThan(1);
  });

  it("goes quiet once her thumb is on one, and while the borrowed beats are owed", () => {
    const { world, t } = warded("slide", 1);
    t.cinchBeat = world.beat;
    expect(word(world, "p2")).toBeNull();
    t.cinchBeat = -1;
    t.breath = 1;
    expect(word(world, "p2")).toBeNull();
  });

  it("asks the pilot to haul the tube once the mouth has stopped coming to them", () => {
    // `open` inhales every beat and its stride is zero: a pinched ring buys
    // nothing there, and the only answer left is to take the mouth off the body.
    const { world, t } = warded("open", CFG.throatRings - 1);
    expect(word(world, "p1")).toBe("HAUL");
    expect(cue(world, "p1")?.kind).toBe("CARRY");
    expect(cue(world, "p1")?.seat).toBe(1);
    expect(word(world, "p2")).toBeNull();
    // On the ring his thumb goes to, which hangs a tile under the lip rather
    // than on it: the word and the handle are one answer now
    // (`throat-grip.ts`), and a mark left on the mouth would be pointing at
    // the one place there is nothing to take hold of.
    const l = LAYOUT.p1;
    const at = throatTubeCircle(l, CFG, t, world.beat, 0);
    expect(Math.abs((cue(world, "p1")?.x ?? 0) - at.x)).toBeLessThan(1);
    expect(Math.abs((cue(world, "p1")?.y ?? 0) - at.y)).toBeLessThan(1);
  });

  it("goes quiet the beat a carry has already asked the mouth to move", () => {
    const { world, t } = warded("open", CFG.throatRings - 1);
    t.haulStep = 1;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("says nothing at all before a ring has been choked", () => {
    // `still`: nothing to pinch and nothing to haul, and the old silence is
    // still the true one — the answer to this rock is a gum, next phase.
    const { world } = warded("still", 0);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("is one word however many rocks are standing in the mouth", () => {
    const { world, t } = warded("slide", 1);
    put(world, "meteor", mouthCol(world, t), throatMouthRow(CFG));
    put(world, "meteor", mouthCol(world, t), throatMouthRow(CFG));
    expect(word(world, "p2")).toBe("CINCH");
  });
});

describe("a rock climbing the gullet", () => {
  const climbing = (): { world: World; t: ThroatState; c: Creature } => {
    const { world, t } = opened();
    const c = put(world, "meteor", mouthCol(world, t), throatMouthRow(CFG) + 2);
    return { world, t, c };
  };

  it("asks either thumb to brake it, on both screens", () => {
    const { world } = climbing();
    expect(word(world, "p1")).toBe("BRAKE");
    expect(word(world, "p2")).toBe("BRAKE");
    expect(cue(world, "p1")?.kind).toBe("HOLD");
    // The carry is either seat's, which `handMeans` says of every rock and
    // this reading calls rather than repeats.
    expect(cue(world, "p1")?.seat).toBeNull();
  });

  it("goes quiet the beat a hand arrives", () => {
    const { world, c } = climbing();
    world.gripP1 = c.id;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("says nothing about a living body climbing, which no hand brakes", () => {
    // A hand on a slick is the pilot's aim and drags at nothing (`grip.ts`),
    // so the word would ask for a gesture that changes no rule. It gets the
    // shot instead, one inhale later, when it reaches the mouth.
    const { world, t } = opened();
    put(world, "slick", mouthCol(world, t), throatMouthRow(CFG) + 2);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});
