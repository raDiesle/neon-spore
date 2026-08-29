import { describe, expect, test } from "bun:test";
import { createWorld, DEFAULT_CONFIG, type WardenState } from "@neon-spore/sim";
import { bindKeyHelp } from "../src/key-help.js";
import { KEY_BINDINGS } from "../src/keys.js";
import { pointerSeat } from "../src/stage-touch.js";

/**
 * THE MOUSE IS ONE HAND, AND THE TETHER BELONGS TO THE OTHER ONE.
 *
 * `pointerSeat` is the whole repair: `p1`/`p2` follow the role bar directly,
 * and `test` — the one case with no unambiguous owner — follows THE WARDEN's
 * own rule for who may pull its tether (`wardenRescuer`), because that rule
 * already alternates by cycle and a seat fixed to player 1 would have been
 * right only half the time. See the doc comment on `pointerSeat` for the
 * argument in full.
 */

const CFG = DEFAULT_CONFIG;

function wardenState(): WardenState {
  return {
    kind: "warden",
    creatureId: 1,
    tetherId: 2,
    pupilCol: 0,
    pupilDir: 1,
    plates: CFG.wardenPlates,
    tornBeat: -1,
    openBeat: -1,
    eyeSpent: false,
    pullTicks: 0,
  };
}

describe("pointerSeat", () => {
  test("p1 and p2 are unambiguous: the pointer is that seat's only hand", () => {
    const world = createWorld(CFG, 1);
    expect(pointerSeat("p1", world, CFG)).toBe(1);
    expect(pointerSeat("p2", world, CFG)).toBe(2);
    // Whichever seat is boss-clamped changes nothing for p1/p2 — the role
    // already answered the question the warden cycle answers for "test".
    world.boss = wardenState();
    expect(pointerSeat("p1", world, CFG)).toBe(1);
    expect(pointerSeat("p2", world, CFG)).toBe(2);
  });

  test("test, with no warden up, keeps today's default of player 1", () => {
    const world = createWorld(CFG, 1);
    expect(pointerSeat("test", world, CFG)).toBe(1);
  });

  test("test, with THE WARDEN up, follows the cycle's own rescuer", () => {
    const world = createWorld(CFG, 1);
    world.boss = wardenState();

    // Cycle 0 clamps the cannon — player 1 — so player 2 is the rescuer and
    // the one whose grab on the tether is not refused (`wardenRefusesGrip`).
    world.waveBeat = 1;
    expect(pointerSeat("test", world, CFG)).toBe(2);

    // Cycle 1 clamps the shield — player 2 — flipping the rescuer to player 1.
    // A seat fixed at player 1 would have been right on this cycle and wrong
    // on the one above it, which is "only when it's near the ship somehow."
    world.waveBeat = 1 + CFG.wardenCycleBeats;
    expect(pointerSeat("test", world, CFG)).toBe(1);
  });
});

/**
 * THE KEYBINDINGS, SHOWN RATHER THAN REMEMBERED.
 *
 * `key-help.ts` renders `KEY_BINDINGS` rather than a second hand-written
 * list, so this proves the read side of that contract: every key `keys.ts`
 * knows about actually reaches the modal's own markup, grouped by whose hand
 * it is. A stub `document`, in the same shape `transport.test.ts` already
 * uses for `pair-panel.ts` — this repo's test runner carries no real DOM.
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

describe("the keybindings modal", () => {
  test("its list is derived from KEY_BINDINGS, one row per key", () => {
    const { body } = stubDocument();
    bindKeyHelp();
    for (const binding of KEY_BINDINGS) {
      expect(body.innerHTML).toContain(binding.key);
      expect(body.innerHTML).toContain(binding.does);
    }
  });

  test("opens on its button and closes on its own close button", () => {
    const { button, modal } = stubDocument();
    bindKeyHelp();
    expect(modal.classList.contains("on")).toBe(false);

    button.click();
    expect(modal.classList.contains("on")).toBe(true);

    closeButton.click();
    expect(modal.classList.contains("on")).toBe(false);
  });

  // "For the time being" — grouped by seat, so a player 2 mystery like `G`
  // reads as an answer the moment the modal opens.
  test("groups by seat: G names player 2 by name, not by code alone", () => {
    const grip = KEY_BINDINGS.find((b) => b.code === "KeyG");
    expect(grip?.seat).toBe(2);
    expect(grip?.does).toContain("grab");
  });
});
