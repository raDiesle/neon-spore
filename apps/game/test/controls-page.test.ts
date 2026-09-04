import { describe, expect, it } from "bun:test";
import { CONTROL_SETS, CONTROLS } from "@neon-spore/content";

/**
 * CONTROLS, and the two ways it goes wrong.
 *
 * The first is drift: it used to be a table of eleven keyboard keys, which is
 * the control scheme almost nobody plays — the game is portrait mobile web and
 * the keys are the rig. So the phone's half is checked for the things a thumb
 * can actually do, including the two that are on no panel and would therefore
 * be described by no list of buttons: a hand held on something falling, and a
 * handle carried across the field.
 *
 * The second is a second copy. Every panel in the game is already written down
 * in `packages/content` with the sentence each control does, and a page that
 * re-typed any of it would be a page that goes on describing a round after the
 * round changed. So what is asserted is that the page *reads* the registry —
 * and that the registry is what a reader would then be shown.
 *
 * There is no DOM in this runner, so this reads the source, the way
 * `how-to-play.test.ts` does.
 */

const src = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-controls.ts", import.meta.url)),
).text();
const settings = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-settings.ts", import.meta.url)),
).text();
const entries = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-entries.ts", import.meta.url)),
).text();

describe("the controls page", () => {
  it("is reached from SETTINGS, and no longer from the front page", () => {
    expect(settings).toContain('show("keys")');
    expect(entries).not.toContain('a.show("keys")');
  });

  it("puts the phone before the desk", () => {
    // The headings as the page appends them, not as the file mentions them:
    // this file's own prose says "CONTROLS AT A DESK" describing what the page
    // used to be, and that is not a section of it.
    const phone = src.indexOf("played on a phone held upright");
    const desk = src.indexOf('el("h2", undefined, "AT A DESK")');
    expect(phone).toBeGreaterThan(-1);
    expect(desk).toBeGreaterThan(phone);
  });

  it("names every shape a thumb meets on a panel", () => {
    for (const form of ["THE BAND", "A STRIP", "A LOBE", "A SLAB"]) {
      expect(src, `the phone's half never says "${form}"`).toContain(form);
    }
  });

  it("describes the controls that are on no panel", () => {
    // The grip: a hand held on something falling drags at it (`sim/grip.ts`),
    // and it is the one control a list of buttons would never mention.
    expect(src).toContain("Press and hold anything falling");
    // A handle hangs over the field and is carried (`render/handles.ts`).
    expect(src).toContain("A HANDLE");
    // The ship itself, which answers a finger where it is drawn as well as on
    // the strips (`render/touch-ship.ts`). The muzzle swipe is the one gesture
    // in the game that exists nowhere on a panel, so this page is the only
    // place a player is ever told about it.
    expect(src).toContain("THE SHIP");
    expect(src).toContain("carries it left for red or right for cyan");
  });

  it("reads the panels off the registry rather than listing them", () => {
    expect(src).toContain("CONTROL_SETS");
    expect(src).toContain("setControls");
    // A set's name typed into this file is a name that outlives its set.
    for (const set of CONTROL_SETS) {
      expect(src, `${set.name} is typed into the page`).not.toContain(`"${set.name}"`);
    }
    for (const c of CONTROLS) {
      expect(src, `${c.id}'s sentence is typed into the page`).not.toContain(c.does);
    }
  });

  it("still carries the keys, for the one person playing both seats", () => {
    for (const key of ["A / D", "J / L", "ESC", "SPACE"]) {
      expect(src, `the desk's table never says "${key}"`).toContain(key);
    }
  });
});
