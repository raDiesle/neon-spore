import { describe, expect, it } from "bun:test";
import { CONTROL_SETS, CONTROLS } from "@neon-spore/content";
import { controlsRow } from "../src/menu-settings.js";

/**
 * CONTROLS, and the three ways it goes wrong.
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
 * The third arrived with the owner's ask of 14 September 2026: **the rig
 * creeping back onto a page read by people playing.** `keys-desk.ts` already
 * draws the line — *what is not here is not a control* — and the keys this page
 * used to list past it were the host talking to a run: the grip, W's two seats
 * in one press, the guide's hold, the wave arrows, pause. They keep working;
 * the page stops teaching them, and the row that opens it is not offered where
 * there is no keyboard at all.
 *
 * There is no DOM in this runner, so this reads the source, the way
 * `input-pc.test.ts` does.
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
const menuView = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-view.ts", import.meta.url)),
).text();

describe("the controls page", () => {
  it("is reached from SETTINGS, and no longer from the front page", () => {
    expect(settings).toContain('show("keys")');
    expect(entries).not.toContain('a.show("keys")');
  });

  /**
   * A phone has no keyboard, and what is left of this page to teach is which
   * key each button is on. So the row is absent rather than present and inert:
   * a row that opens a page about keys, on a device with none, is a row that
   * costs a reader the press to find that out.
   */
  it("is not offered at all where the pointer is a thumb", () => {
    expect(controlsRow(() => {}, false)).toBeNull();
    // And the page is reachable through nothing else, so a phone cannot land
    // on it by another door.
    expect(settings).toContain("atADesk()");
    for (const source of [entries, menuView]) {
      expect(source).not.toContain('"keys"');
    }
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
    for (const form of ["THE BAND", "A STRIP", "A LOBE"]) {
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

  /**
   * The rig's keys, named one at a time, because each of them is a thing
   * somebody could reasonably think belongs on a page called CONTROLS — and
   * each of them is the host talking to a run rather than a seat talking to a
   * ship (`content/src/keys-desk.ts`).
   */
  it("teaches no key that is the rig rather than a seat", () => {
    const desk = src.slice(src.indexOf("const KEYS"));
    for (const key of ["SPACE", '", / ."', '"W"', '"P"', "← / →"]) {
      expect(desk, `the desk's table still says ${key}`).not.toContain(key);
    }
    // ESC stays: closing what you are reading is not a rig key.
    expect(desk).toContain("ESC");
  });

  it("does not call the desk the rig, now that two people play at one", () => {
    expect(src).not.toContain("One person playing both seats");
    expect(src).not.toContain("the rig, not the game");
  });

  it("reads a control's key off the table the keyboard reads", () => {
    // A key belongs to a slot on the panel and not to a control
    // (`content/src/keys-desk.ts`), so which key a button is on is a different
    // answer per panel and this page must ask rather than tell. A hand-typed
    // row would be the same drift the panels themselves were freed of above.
    expect(src).toContain("deskKeys");
    expect(src).not.toContain('"KeyI"');
    expect(src).not.toContain('"KeyQ"');
  });
});
