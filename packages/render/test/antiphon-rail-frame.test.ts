import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { chooseWord, count, drawn, frame, grown, hung } from "./antiphon-frame-harness.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE ANTIPHON's rail, on all three screens — the mirror of the organ, at
 * `antiphon-frame.test.ts`: the same states, set rather than played to, but
 * read from the chooser's side, and the one thing nothing else in the suite
 * could catch, that the **rail** is on the chooser's screen and not the
 * explainer's — the navigator's on the first level.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

/** The organ grown with its rail, and the same organ with none: the difference is the rail's. */
const railed = (role: ViewRole) => frame(role, (w) => void grown(w)).text;
const none = (role: ViewRole) =>
  frame(role, (w) => {
    grown(w).rail = [];
  }).text;

describe("THE ANTIPHON's rail", () => {
  it("puts the rail on the chooser's screen and not the explainer's", () => {
    expect(count(railed("p2"), PALETTE.organ)).toBeGreaterThan(count(none("p2"), PALETTE.organ));
    expect(count(railed("test"), PALETTE.organ)).toBeGreaterThan(
      count(none("test"), PALETTE.organ),
    );
    expect(count(railed("p1"), PALETTE.organ)).toBe(count(none("p1"), PALETTE.organ));
    // And nothing on the chooser's screen marks the organ: the answer moved
    // to another candidate is the same picture.
    const answerIs = (i: number) =>
      frame("p2", (w) => {
        grown(w).answer = i;
      }).text;
    expect(answerIs(0)).toBe(answerIs(2));
  });

  it("draws no red and no cyan on any candidate: a colour no control wears", () => {
    for (const role of ["p2", "test"] as const) {
      expect(count(railed(role), PALETTE.redRim)).toBe(count(none(role), PALETTE.redRim));
      expect(count(railed(role), PALETTE.cyanRim)).toBe(count(none(role), PALETTE.cyanRim));
    }
  });

  it("carries the candidate in hand down toward the organ, and a bead with it on the explainer's", () => {
    const carried = (role: ViewRole, milli: number) =>
      frame(role, (w) => {
        const s = grown(w);
        s.carried = 0;
        s.carryMilli = milli;
      }).text;
    expect(carried("p2", 500)).not.toBe(carried("p2", 0));
    expect(carried("p2", 500)).not.toBe(carried("p2", 800));
    // The explainer is shown no candidate, only a bead coming down the vein
    // (`antiphon-veins.ts`): the same bead whichever candidate it is.
    expect(carried("p1", 500)).not.toBe(carried("p1", 0));
    const bead = (shape: number) =>
      frame("p1", (w) => {
        const s = grown(w);
        const c = s.rail[0];
        if (c !== undefined) c.shape = shape;
        s.carried = 0;
        s.carryMilli = 500;
      }).text;
    expect(bead(2)).toBe(bead(11));
  });

  it("says CHOOSE once where the veins end, and never on the explainer's screen", () => {
    // One word under the organ's place rather than one per candidate: a
    // word on the candidate being described would be the chooser's own
    // reading handed back (`boss-cue-read-p.ts`).
    const world = hung();
    grown(world);
    expect(chooseWord(drawn(world, "p2", 3).words).length).toBe(1);
    expect(chooseWord(drawn(world, "p1", 3).words)).toEqual([]);
  });

  it("keeps the word up while a candidate is in hand, where it is carried to", () => {
    const world = hung();
    grown(world).carried = 1;
    expect(chooseWord(drawn(world, "p2", 3).words).length).toBe(1);
  });

  it("draws the organ and each candidate at its resting turn, and nought as it ships", () => {
    // `sim/antiphon-turn.ts` sets the turns; with the figure off they are all
    // nought and the picture is the one above.
    const organ = (turn: number) =>
      frame("p1", (w) => {
        const s = grown(w);
        s.rail = [];
        if (s.organ !== null) s.organ.turn = turn;
      }).text;
    const decoy = (turn: number) =>
      frame("p2", (w) => {
        const c = grown(w).rail[0];
        if (c !== undefined) c.turn = turn;
      }).text;
    expect(organ(1)).not.toBe(organ(0));
    expect(decoy(2)).not.toBe(decoy(0));
    expect(decoy(0)).toBe(railed("p2"));
  });
});
