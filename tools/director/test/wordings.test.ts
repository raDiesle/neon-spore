import { describe, expect, test } from "bun:test";
import { computeLayout, computeStage } from "@neon-spore/render";
import { PHONE } from "../src/pose-art.js";
import { WORDING_SCREENS } from "../src/wordings.js";
import { GLOSSARY } from "../src/wordings-glossary.js";
import { BULB_COL, SHIELD_COL, wordingsWorld } from "../src/wordings-world.js";

/**
 * The WORDINGS page's picture and its labels, without a canvas.
 *
 * The frame itself is a browser's, but everything that decides what is on it
 * and where each label points is simulation and layout arithmetic, and a
 * label that points at nothing — a shot that already landed, a lobe the set
 * stopped naming — would be the page quietly telling the owner a word for a
 * thing that is not in the picture.
 */

const world = wordingsWorld();

function layoutFor(role: "p1" | "p2") {
  const stage = computeStage(PHONE, world.cfg, role);
  return computeLayout(
    { width: stage.width, height: stage.height, dpr: PHONE.dpr },
    world.cfg,
    role,
  );
}

describe("the wordings world", () => {
  test("carries everything the labels name at once", () => {
    expect(world.over).toBe(false);
    expect(world.scars.length).toBeGreaterThan(0);
    expect(world.creatures.map((c) => c.kind).sort()).toEqual(["bulb", "slick"]);
    expect(world.bullets.length).toBe(1);
    expect(world.cannonCol).toBe(BULB_COL);
    expect(world.shieldCol).toBe(SHIELD_COL);
    // Something still to come, so the strip has a blip and the siren a call.
    expect(world.queue.length).toBeGreaterThan(world.spawned);
  });

  test("is built the same twice, so both screens show one world", () => {
    const again = wordingsWorld();
    expect(again.tick).toBe(world.tick);
    expect(again.bullets).toEqual(world.bullets);
  });
});

describe("every label", () => {
  for (const screen of WORDING_SCREENS) {
    const l = layoutFor(screen.role as "p1" | "p2");

    test(`${screen.title}: points inside the phone, or is left off`, () => {
      for (const c of screen.callouts) {
        const at = c.at(l, world);
        if (!at) continue;
        expect(at.x, c.name).toBeGreaterThanOrEqual(0);
        expect(at.x, c.name).toBeLessThanOrEqual(l.width);
        expect(at.y, c.name).toBeGreaterThanOrEqual(0);
        expect(at.y, c.name).toBeLessThanOrEqual(l.height);
      }
    });

    test(`${screen.title}: names each thing once`, () => {
      const names = screen.callouts.map((c) => c.name);
      expect(new Set(names).size).toBe(names.length);
    });

    test(`${screen.title}: names this seat's own buttons and strip`, () => {
      const shown = screen.callouts.filter((c) => c.at(l, world)).map((c) => c.name);
      const own =
        screen.role === "p1"
          ? ["cannon strip", "guard lobe", "SUCK lobe · the maw"]
          : ["shield strip", "RED lobe", "CYAN lobe"];
      for (const name of own) expect(shown).toContain(name);
      // And the things both phones carry.
      for (const name of ["hull", "cannon", "shield", "scar", "shot", "the siren", "the band"])
        expect(shown).toContain(name);
    });
  }

  test("is written in plain words, with nothing a reader has to open", () => {
    const texts = [
      ...WORDING_SCREENS.flatMap((s) => s.callouts.map((c) => c.says)),
      ...GLOSSARY.map(([, says]) => says),
    ];
    for (const t of texts) {
      expect(t, t).not.toMatch(/`|\.ts\b|\.md\b/);
      expect(t.length, t).toBeGreaterThan(20);
    }
  });
});
