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
import { spyHolds } from "./soak-spy.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE ANTIPHON's body, its pits, its organ and its end, on all three
 * screens.
 *
 * The states are **set** rather than played to, `scuttle-frame.test.ts`'s
 * arrangement: `sim/test/antiphon.test.ts` proves the cycle, the pit, the
 * hardening and the ship, and what this file asks is whether every branch
 * of the picture is one a canvas accepts — bare, an organ up, pitted, still,
 * the ship, down, gone — and the one thing nothing else in the suite could
 * catch: that the **organ** is on the explainer's screen and not the
 * chooser's, the pilot's on the first level and the navigator's on the next;
 * and that the eruption is a transient the next run does not
 * inherit. The rail is the mirror of it, at `antiphon-rail-frame.test.ts`.
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

  it("puts the organ on the explainer's screen and not the chooser's", () => {
    // An organ up, with nothing on the rail, is more of the organs' green on
    // the screen shown the organ, and none of it on the screen that is not.
    const alone = (role: ViewRole) =>
      frame(role, (w) => {
        grown(w).rail = [];
      }).text;
    const none = (role: ViewRole) => frame(role, () => {}).text;
    expect(count(alone("p1"), PALETTE.organ)).toBeGreaterThan(count(none("p1"), PALETTE.organ));
    expect(count(alone("test"), PALETTE.organ)).toBeGreaterThan(count(none("test"), PALETTE.organ));
    expect(count(alone("p2"), PALETTE.organ)).toBe(count(none("p2"), PALETTE.organ));
    // Two shapes are two pictures.
    expect(alone("p1")).not.toBe(frame("p1", (w) => (grown(w, 9).rail = [])).text);
  });

  it("moves the organ to the other screen when the seats swap, a level on", () => {
    const swapped = (role: ViewRole) =>
      frame(role, (w) => {
        const s = grown(w);
        s.rail = [];
        s.pits = [4];
      }).text;
    const pitted = (role: ViewRole) =>
      frame(role, (w) => {
        bare(w).pits = [4];
      }).text;
    expect(count(swapped("p2"), PALETTE.organ)).toBeGreaterThan(count(pitted("p2"), PALETTE.organ));
    expect(count(swapped("p1"), PALETTE.organ)).toBe(count(pitted("p1"), PALETTE.organ));
  });

  it("draws the organ's grip on the explainer's screen with no word, and nothing on the chooser's", () => {
    // The mark is the HOLD LAB's drop, sunk while a thumb holds it, and no
    // word stands under it: a turn on the field says itself with its grip
    // (the owner, 13 October 2026; `asksGrab`), and a hold with the drop.
    const up = spyHolds(() => frame("p1", (w) => void grown(w)));
    expect(turnWord(up.out.words)).toBe(false);
    expect(up.holds.length).toBeGreaterThan(0);
    expect(up.holds.some((h) => h.o.held === true)).toBe(false);
    const held = spyHolds(() =>
      frame("p1", (w) => {
        grown(w).heldP2 = true;
      }),
    );
    expect(turnWord(held.out.words)).toBe(false);
    expect(held.holds.some((h) => h.o.held === true)).toBe(true);
    // The chooser's screen never takes the organ's mark.
    expect(spyHolds(() => frame("p2", (w) => void grown(w))).holds).toEqual([]);
  });

  it("draws the organ turned as far as the thumb has turned it, on the explainer's screen only", () => {
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
    expect(f.text).not.toBe(
      frame(role, (w) => {
        ship(w).organ = null;
      }).text,
    );
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
 * **The organ says no word** (`render/src/boss-cue-text.ts`, `asksGrab`): a
 * turn on the field is a grab, and the owner, 13 October 2026, took every
 * grab's word away — *"turn" … all of that we do not need*.
 */
describe("THE ANTIPHON's word", () => {
  it("is not drawn on either screen", () => {
    const world = hung();
    grown(world);
    expect(turnWord(drawn(world, "p1", 3).words)).toBe(false);
    expect(turnWord(drawn(world, "p2", 3).words)).toBe(false);
  });
});
