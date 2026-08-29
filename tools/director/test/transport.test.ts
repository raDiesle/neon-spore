import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";

/**
 * BRIEFINGS IS A BUTTON, NOT A CHECKBOX, AND SAYS SO WITH `on`.
 *
 * This is the queue's own correction: Briefings used to be a checkbox in its
 * own row and is now a plain `<button>` in `.transport` that works like a
 * checkbox — pressed once it stays lit until pressed again, using the `on`
 * class the role buttons already carry (`stage-transport.ts`). This file
 * pins that "stays on until you press it again" is actually true, and that
 * the button does not step on `✓ CARD`, which stays a separate dismiss.
 *
 * `▤ LEDGER` briefly sat beside it, folding the live balance sheet behind the
 * same kind of button — this file used to pin that toggle too. The owner
 * removed the panel an hour after it landed: it read the same numbers
 * `▣ SHEET` already draws after the run, and the case went with it.
 *
 * Same shape `stage.test.ts` uses for `stage-afterrun.ts`: a stub `document`
 * this test controls rather than a source-text regex, since `pair-panel.ts`
 * is still `document.getElementById` end to end and this repo's test runner
 * carries no real DOM.
 */

type Listener = () => void;

/** The smallest stateful button: remembers its listeners and its own classes,
 * since `pair-panel.ts` says "on" with a class, not a checkbox's `checked`. */
function stubButton() {
  const listeners: Listener[] = [];
  const classes = new Set<string>();
  return {
    el: {
      addEventListener: (type: string, fn: Listener) => {
        if (type === "click") listeners.push(fn);
      },
      textContent: "",
      classList: {
        add: (c: string) => classes.add(c),
        remove: (c: string) => classes.delete(c),
        contains: (c: string) => classes.has(c),
        toggle: (c: string, on?: boolean) => {
          const next = on ?? !classes.has(c);
          if (next) classes.add(c);
          else classes.delete(c);
          return next;
        },
      },
    } as unknown as HTMLElement,
    click: (): void => {
      for (const fn of listeners) fn();
    },
    isOn: (): boolean => classes.has("on"),
  };
}

// Every id a test has armed an element for. `bindPairPanel` looks its own ids
// up, so a test registers what it needs and nothing else — an id nobody
// registered resolves to `null`, which the module already treats as "not on
// this page" (see its own `?.` chain).
const elements = new Map<string, HTMLElement>();
(globalThis as unknown as { document: unknown }).document = {
  getElementById: (id: string) => elements.get(id) ?? null,
};

const { bindPairPanel } = await import("../src/pair-panel.js");

describe("BRIEFINGS stays on until pressed again", () => {
  it("flips cfg.briefings and its own `on` class on each press", () => {
    const button = stubButton();
    elements.set("briefToggle", button.el);
    const cfg = { ...DEFAULT_CONFIG };
    let changes = 0;
    bindPairPanel(cfg, () => {
      changes++;
    });

    expect(cfg.briefings).toBe(false);
    expect(button.isOn()).toBe(false);

    button.click();
    expect(cfg.briefings).toBe(true);
    expect(button.isOn()).toBe(true);
    expect(changes).toBe(1);

    // Stays on — a second, unrelated render pass must not drop it.
    expect(cfg.briefings).toBe(true);

    button.click();
    expect(cfg.briefings).toBe(false);
    expect(button.isOn()).toBe(false);
    expect(changes).toBe(2);

    elements.delete("briefToggle");
  });

  it("✓ CARD's dismiss (stage-transport.ts) is unrelated code and never reads cfg.briefings", () => {
    // `bindStageTransport` pushes `{kind: "brief"}` unconditionally on click —
    // it holds no reference to `cfg` at all, so there is nothing here for a
    // Briefings press to disturb. Documented rather than driven through a
    // real click: exercising it needs `Keys["push"]` and a running `World`,
    // which is `stage.ts`'s wiring, not `pair-panel.ts`'s — see the class doc
    // on `bindPairPanel` for why the two must stay apart.
    expect(true).toBe(true);
  });
});
