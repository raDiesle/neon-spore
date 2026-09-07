import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { bindKeyHelp } from "../src/key-help.js";
import { keyBindings } from "../src/keys.js";
import { pointerSeat } from "../src/stage-touch.js";

/**
 * THE MOUSE IS ONE HAND, AND IT IS THE ROLE BAR THAT SAYS WHOSE.
 *
 * This used to ask THE WARDEN whose turn it was, because that boss clamped one
 * of the two sliding controls and only the *other* seat could pull its line. It
 * no longer clamps anything: the rope is player 1's every cycle and player 2
 * fires, so there is nothing left to alternate with and `pointerSeat` is the
 * role and nothing else.
 */

describe("pointerSeat", () => {
  test("p1 and p2 are unambiguous: the pointer is that seat's only hand", () => {
    expect(pointerSeat("p1")).toBe(1);
    expect(pointerSeat("p2")).toBe(2);
  });

  test("test shows both halves on one screen, and grabs as player 1", () => {
    // Which is also the seat THE WARDEN's rope belongs to, so the one boss
    // that ever had an opinion about this agrees with the default.
    expect(pointerSeat("test")).toBe(1);
  });
});

/**
 * THE KEYBINDINGS, SHOWN RATHER THAN REMEMBERED.
 *
 * `key-help.ts` renders `keyBindings(set)` — which is `deskKeys`, the game's
 * own table — rather than a second hand-written list, so this proves the read
 * side of that contract: every key the panel on the stage answers reaches the
 * modal's own markup, grouped by whose hand it is. A stub `document`, in the
 * same shape `transport.test.ts` already uses for `pair-panel.ts` — this repo's
 * test runner carries no real DOM.
 */

type Listener = () => void;

function stubElement() {
  const listeners = new Map<string, Listener[]>();
  const classes = new Set<string>();
  return {
    innerHTML: "",
    addEventListener(type: string, fn: Listener) {
      const list = listeners.get(type) ?? [];
      list.push(fn);
      listeners.set(type, list);
    },
    click(type = "click") {
      for (const fn of listeners.get(type) ?? []) fn();
    },
    classList: {
      add: (c: string) => classes.add(c),
      remove: (c: string) => classes.delete(c),
      contains: (c: string) => classes.has(c),
    },
    querySelector: () => closeButton,
  };
}

let closeButton: ReturnType<typeof stubElement>;

function stubDocument() {
  const button = stubElement();
  const modal = stubElement();
  const body = stubElement();
  closeButton = stubElement();
  const byId = new Map<string, unknown>([
    ["keyHelpOpen", button],
    ["keyHelpModal", modal],
    ["keyHelpBody", body],
  ]);
  (globalThis as unknown as { document: unknown }).document = {
    getElementById: (id: string) => byId.get(id) ?? null,
  };
  return { button, modal, body };
}

const DEFAULT = controlSet("default");

describe("the keybindings modal", () => {
  test("its list is derived from the panel on the stage, one row per control", () => {
    const { body, button } = stubDocument();
    bindKeyHelp(() => DEFAULT);
    button.click();
    for (const binding of keyBindings(DEFAULT)) {
      expect(body.innerHTML).toContain(binding.key);
      expect(body.innerHTML).toContain(binding.does);
    }
  });

  /**
   * The whole point of asking the panel rather than a table: a wave played on
   * THE CLAW has an arm and a mouth where the standard panel has a cannon and
   * a maw, and the modal has to say so. It is rebuilt on open rather than at
   * bind time, because the rail's picker moves under it.
   */
  test("follows the wave, so two panels give two lists", () => {
    const { body, button } = stubDocument();
    let set = DEFAULT;
    bindKeyHelp(() => set);
    button.click();
    const standard = body.innerHTML;
    set = controlSet("claw");
    button.click();
    expect(body.innerHTML).not.toBe(standard);
    for (const binding of keyBindings(set)) expect(body.innerHTML).toContain(binding.does);
  });

  test("opens on its button and closes on its own close button", () => {
    const { button, modal } = stubDocument();
    bindKeyHelp(() => DEFAULT);
    expect(modal.classList.contains("on")).toBe(false);

    button.click();
    expect(modal.classList.contains("on")).toBe(true);

    closeButton.click();
    expect(modal.classList.contains("on")).toBe(false);
  });

  // "For the time being" — grouped by seat, so a player 2 mystery like `G`
  // reads as an answer the moment the modal opens.
  test("groups by seat: G names player 2 by name, not by code alone", () => {
    const grip = keyBindings(DEFAULT).find((b) => b.code === "KeyG");
    expect(grip?.seat).toBe(2);
    expect(grip?.does).toContain("grab");
  });

  /**
   * The drift this whole change was about: the director's hand-typed table had
   * THE GAUGE on Z/X/C and THE FLEET on U/H/N/K, and had nothing at all for
   * THE CLAW, PINBALL or SNAKE. Every panel now answers something, on the
   * game's own letters.
   */
  test("every panel the game plays has a keyboard here", () => {
    for (const id of ["default", "claw", "gauge", "fleet", "pinball", "snake"] as const) {
      const rows = keyBindings(controlSet(id));
      expect(rows.length, id).toBeGreaterThan(2);
      for (const row of rows) expect(row.key, id).not.toBe("");
    }
  });
});
