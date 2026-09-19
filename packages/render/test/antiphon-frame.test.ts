import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { World } from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  bare,
  count,
  down,
  drawn,
  frame,
  grown,
  hung,
  ship,
  TPB,
  turnWord,
} from "./antiphon-frame-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE ANTIPHON's body, its pits, its organ and its end, on all three
 * screens.
 *
 * The states are **set** rather than played to, `scuttle-frame.test.ts`'s
 * arrangement: `sim/test/antiphon.test.ts` proves the cycle, the pit, the
 * hardening and the ship, and what this file asks is whether every branch
 * of the picture is one a canvas accepts — bare, an organ up, twins, pitted,
 * still, the ship, down, gone — and the one thing nothing else in the suite
 * could catch: that the **organ** is on the pilot's screen and not the
 * navigator's; and that the eruption is a transient the next run does not
 * inherit. Her rail is the mirror of it, at `antiphon-rail-frame.test.ts`.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const L = computeLayout(VIEWPORT, CFG, "test");

describe("THE ANTIPHON's body", () => {
  it.each(ROLES)("draws the body on %s", (role) => {
    const f = frame(role, () => {});
    expect(f.calls).toBeGreaterThan(200);
    expect(f.text).toContain(PALETTE.hull);
  });

  it("puts the organ on the pilot's screen and not the navigator's", () => {
    // An organ up, with nothing on the rail, is more of the hull's rim on the
    // screen shown the organ, and the same rim count on the screen that is
    // not — the window under it is hers, but it is drawn in the shield's tone.
    const alone = (role: ViewRole) =>
      frame(role, (w) => {
        grown(w).rail = [];
      }).text;
    const none = (role: ViewRole) => frame(role, () => {}).text;
    expect(count(alone("p1"), PALETTE.hullRim)).toBeGreaterThan(count(none("p1"), PALETTE.hullRim));
    expect(count(alone("test"), PALETTE.hullRim)).toBeGreaterThan(
      count(none("test"), PALETTE.hullRim),
    );
    expect(count(alone("p2"), PALETTE.hullRim)).toBe(count(none("p2"), PALETTE.hullRim));
    // Nor is an organ's shape or column on his screen given away by the
    // organ standing elsewhere: two shapes are two pictures, two columns one.
    const at = (col: number) =>
      frame("p1", (w) => {
        const s = grown(w);
        s.rail = [];
        for (const o of s.organs) o.col = col;
      }).text;
    expect(at(2)).toBe(at(6));
    expect(alone("p1")).not.toBe(frame("p1", (w) => (grown(w, 9).rail = [])).text);
  });

  it("stands twins a gap apart on the pilot's screen", () => {
    const one = frame("p1", (w) => void grown(w)).text;
    const two = frame("p1", (w) => {
      const s = grown(w);
      s.organs.push({ shape: 2, col: 6, color: "cyan", grownBeat: s.organs[0]?.grownBeat ?? 0 });
    }).text;
    expect(two).not.toBe(one);
    expect(count(two, PALETTE.hullRim)).toBeGreaterThan(count(one, PALETTE.hullRim));
  });

  it("draws the organ's grip with the word on the pilot's screen, and neither on the navigator's", () => {
    // The mark is drawn in the rock's grey whether or not a thumb holds it;
    // the word under it shares that same fill (`boss-cue-text.ts`) and shows
    // only while nothing holds the mark, so a count taken while the word can
    // also be showing cannot tell the mark from the word sitting under it —
    // a held mark can, since the word is gone and the mark is not
    // (`frame-colours.test.ts`'s EXCEPTIONS for why this pairing is the fix).
    const none = frame("p1", () => {});
    const up = frame("p1", (w) => void grown(w));
    expect(turnWord(up.words)).toBe(true);
    expect(turnWord(none.words)).toBe(false);
    const held = frame("p1", (w) => {
      grown(w).heldP2 = true;
    });
    expect(turnWord(held.words)).toBe(false);
    expect(held.text).not.toBe(up.text);
    expect(count(held.text, PALETTE.rock)).toBeGreaterThan(count(none.text, PALETTE.rock));
    // Her screen never takes the organ's mark. Her own rail carries a word in
    // that same grey (`antiphon-rail-grip.ts`), so the count is read with her
    // thumb resting on a candidate, which takes PULL away and leaves behind
    // only whatever the organ would have added.
    const hers = frame("p2", (w) => {
      grown(w).heldRail = 0;
    });
    expect(count(hers.text, PALETTE.rock)).toBe(count(frame("p2", () => {}).text, PALETTE.rock));
    expect(turnWord(hers.words)).toBe(false);
  });

  it("draws the organ turned as far as the thumb has turned it, on the pilot's screen only", () => {
    const turned = (role: ViewRole, ticks: number) =>
      frame(role, (w) => {
        grown(w).turnTicks = ticks;
      }).text;
    const quarter = Math.floor((TPB * CFG.antiphonTurnBeats) / 4);
    expect(turned("p1", quarter)).not.toBe(turned("p1", 0));
    expect(turned("p1", quarter)).not.toBe(turned("p1", quarter * 2));
    // A whole turn is upright again.
    expect(turned("p1", TPB * CFG.antiphonTurnBeats)).toBe(turned("p1", 0));
    // And the rail never turns: her screen is the same picture at any turn.
    expect(turned("p2", quarter)).toBe(turned("p2", 0));
  });

  it.each(ROLES)("sinks a pit into the body for every shape named, on %s", (role) => {
    const none = frame(role, () => {}).text;
    const pitted = frame(role, (w) => {
      bare(w).pits = [0, 5, 9];
    }).text;
    expect(count(pitted, PALETTE.dim)).toBeGreaterThan(count(none, PALETTE.dim));
  });

  it.each(ROLES)("goes glassy and still with every pit there, on %s", (role) => {
    const full = frame(role, (w) => {
      bare(w).pits = [0, 5, 9, 12, 2, 7];
    }).text;
    const still = frame(role, (w) => {
      const s = bare(w);
      s.pits = [0, 5, 9, 12, 2, 7];
      s.stillBeat = w.beat - 1;
    }).text;
    expect(still).not.toBe(full);
  });

  it.each(ROLES)("grows their own ship on a rail of hulls, on %s", (role) => {
    const f = frame(role, ship);
    expect(f.calls).toBeGreaterThan(200);
    expect(f.text).not.toBe(frame(role, (w) => (ship(w).organs = [])).text);
  });

  it.each(ROLES)("closes the body in and fades it once the right ship is named, on %s", (role) => {
    const stood = frame(role, ship);
    const going = frame(role, down);
    expect(count(going.text, PALETTE.hull)).toBeLessThan(count(stood.text, PALETTE.hull));
    const gone = frame(role, (w) => {
      down(w).downBeat = w.beat - CFG.antiphonOutBeats - 1;
    });
    const none = frame(role, (w: World) => {
      w.boss = null;
    });
    expect(gone.text).toBe(none.text);
  });

  it("keeps the eruption as a transient the next run does not inherit", () => {
    const fx = new Effects();
    fx.boss.antiphon.note([0, 5, 9]);
    fx.ingest([{ type: "antiphonBurst", col: 4, pits: 3 }], L, 0, () => 0, CFG);
    fx.update(1 / 60, L);
    expect(fx.boss.antiphon.erupting).toBe(true);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});

/**
 * **The organ's word is the field's one cue** (`docs/decisions.md` #34,
 * `render/src/boss-cue-text.ts`), for `sinew-frame.test.ts`' reason. The seat
 * is the pilot's twice over: the organ hangs on his screen alone
 * (`showsAntiphonOrgan`) and the cue asks again before it is drawn, so a screen
 * that somehow got the body would still not get the instruction.
 */
describe("THE ANTIPHON's word", () => {
  it("says the verb once on the pilot's screen, in the cue's grey", () => {
    const world = hung();
    grown(world);
    const { words, text } = drawn(world, "p1", 3);
    // Once and not twice: the kind of action here *is* `TURN`, and a kind line
    // repeating the verb is dropped (`boss-cue-text.ts`).
    expect(words.filter((w) => w === "TURN").length).toBe(1);
    expect(text).toContain(PALETTE.rock);
  });

  it("says nothing at all on the navigator's, who has no organ to turn", () => {
    const world = hung();
    grown(world);
    expect(turnWord(drawn(world, "p2", 3).words)).toBe(false);
  });
});
