import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol } from "@neon-spore/sim";
import { fieldX } from "../src/field-flip.js";
import { flueCardRect } from "../src/flue-card.js";
import { flueCentre, flueEmberAt, flueSightAt } from "../src/flue-shape.js";
import { rgba } from "../src/hex.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { lastBossAim } from "../src/slow-boss-aim-d.js";
import { stepColour } from "../src/step-colour.js";
import { showsFlueEmber } from "../src/view-role-clocks-c.js";
import { BEAM, BOLT, count, frame, posed, stood } from "./flue-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE FLUE, drawn (`render/src/flue-draw.ts`): the units across the top of
 * the field, flat, the ember in its slot on the pilot's screen and nowhere
 * on the navigator's, the sight over the held cannon in the level's colour
 * with the beam's bar on a beam level, the strings it hangs on cut one a
 * shot spent, the spore cracking a level cleared, and a lobe lit for every
 * level cleared — on all three screens, set rather than
 * played to; `sim/test/flue.test.ts` proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const MID = midCol(CFG);
/** Any alpha of a colour, as `rgba` writes it. */
const anyAlpha = (hex: string) => rgba(hex, 0).slice(0, -2);

describe("THE FLUE's body", () => {
  it.each(ROLES)("draws the units and the slot, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w, null));
    expect(count(drawn, PALETTE.flueSoot)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.flueSlot)).toBeGreaterThan(0);
  });

  it("lays the ember over its column and the sight over the cannon, turned with the field", () => {
    for (const role of ROLES) {
      const l = computeLayout(VIEWPORT, CFG, role);
      expect(flueEmberAt(l, CFG, 1000).x).toBeCloseTo(fieldX(l, MID + 1), 6);
      expect(flueEmberAt(l, CFG, -2000).x).toBeCloseTo(fieldX(l, MID - 2), 6);
      expect(flueSightAt(l, CFG).x).toBeCloseTo(fieldX(l, MID), 6);
    }
  });

  it.each(ROLES)("cuts a string, raw red, for every shot spent, on %s", (role) => {
    const raw = anyAlpha(PALETTE.red);
    const all = frame(role, (w) => posed(w, BOLT));
    const two = frame(role, (w) =>
      posed(w, BOLT, 0, (s) => {
        s.shots = 2;
      }),
    );
    const one = frame(role, (w) =>
      posed(w, BOLT, 0, (s) => {
        s.shots = 1;
      }),
    );
    expect(count(two, raw)).toBeGreaterThan(count(all, raw));
    expect(count(one, raw)).toBeGreaterThan(count(two, raw));
  });

  it("cracks the spore a level cleared, on the pilot's screen only", () => {
    const crack = rgba(PALETTE.flueSlot, 0.9);
    const cracked = (role: "p1" | "p2", hits: number) =>
      count(
        frame(role, (w) =>
          posed(w, BOLT, 2000, (s) => {
            s.hits = hits;
          }),
        ),
        crack,
      );
    expect(cracked("p1", 1)).toBeGreaterThan(cracked("p1", 0));
    expect(cracked("p1", 3)).toBeGreaterThan(cracked("p1", 1));
    expect(cracked("p2", 3)).toBe(cracked("p2", 0));
  });

  it.each(ROLES)("lights a lobe for every level cleared, on %s", (role) => {
    const pale = anyAlpha(PALETTE.hullRim);
    const none = frame(role, (w) => posed(w, null));
    const two = frame(role, (w) =>
      posed(w, null, 0, (s) => {
        s.hits = 2;
        s.cursor = 2;
      }),
    );
    expect(count(two, pale)).toBeGreaterThan(count(none, pale));
  });
});

describe("THE FLUE's sight", () => {
  it.each(ROLES)("is drawn in the colour the level asks, on %s", (role) => {
    const red = anyAlpha(stepColour("red").rim);
    const lit = frame(role, (w) => posed(w, BOLT));
    const cyanLit = frame(role, (w) => posed(w, { ...BOLT, color: "cyan" }));
    expect(count(lit, stepColour("red").rim) + count(lit, red)).toBeGreaterThan(
      count(cyanLit, stepColour("red").rim) + count(cyanLit, red),
    );
  });

  // Between levels, where the sight stands for the next one and no cue is up:
  // the navigator's crosshair and HOLD circle are in the level's colour too
  // (`boss-cue-read-zo.ts`), and would be counted with the bar.
  it.each(ROLES)("wears the beam's bar on a beam level and not a bolt one, on %s", (role) => {
    const cyan = stepColour("cyan").rim;
    const resting = (s: { phase: string }) => {
      s.phase = "rest";
    };
    const bolt = frame(role, (w) => posed(w, { ...BEAM, weapon: "bolt" }, 0, resting));
    const beam = frame(role, (w) => posed(w, BEAM, 0, resting));
    expect(count(beam, cyan)).toBeGreaterThan(count(bolt, cyan));
  });
});

describe("THE FLUE's split: the ember is the pilot's", () => {
  it("shows the ember to the pilot and the test seat and never to the navigator", () => {
    expect(showsFlueEmber("p1")).toBe(true);
    expect(showsFlueEmber("test")).toBe(true);
    expect(showsFlueEmber("p2")).toBe(false);
  });

  it("draws the ember on the pilot's screen and not on the navigator's", () => {
    // Between levels nothing asks, so the ember is the one thing of the
    // flue's the two screens draw differently.
    const ember = rgba(PALETTE.hullRim, 1);
    const p1 = frame("p1", (w) => posed(w, null));
    const p2 = frame("p2", (w) => posed(w, null));
    expect(count(p1, ember)).toBeGreaterThan(count(p2, ember));
  });
});

describe("THE FLUE under THE SLOW", () => {
  it("is aimed at as the whole row, and left whole by the split", () => {
    const world = stood();
    posed(world, BEAM);
    const l = computeLayout(VIEWPORT, CFG, "test");
    const aim = lastBossAim(world, l, world.beat, 0);
    expect(aim).not.toBeNull();
    if (aim === null) return;
    const c = flueCentre(l, CFG);
    expect(Math.abs(aim.y - c.y)).toBeLessThan(l.tile * 0.01);
    expect(Math.abs(aim.ax - aim.x) + 2 * aim.r).toBeGreaterThan(l.cols * l.tile - 1);
    // And left whole by the split, edge to edge, the strings over it and the card under it.
    const sharp = aim.sharp;
    expect(sharp).toBeDefined();
    if (sharp === undefined) return;
    expect(sharp.x).toBeLessThanOrEqual(l.gridLeft);
    expect(sharp.x + sharp.w).toBeGreaterThanOrEqual(l.gridLeft + l.cols * l.tile);
    const card = flueCardRect(l, c.y);
    expect(sharp.y).toBeLessThan(c.y - l.tile * 2);
    expect(sharp.y + sharp.h).toBeGreaterThan(card.y + card.h);
  });
});
