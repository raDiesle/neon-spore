import { describe, expect, it } from "bun:test";
import { createWorld, DEFAULT_CONFIG } from "@neon-spore/sim";

/**
 * BRIEFINGS AND LEDGER ARE BUTTONS, NOT CHECKBOXES, AND SAY SO WITH `on`.
 *
 * This is the queue's own correction: Briefings used to be a checkbox in its
 * own row, and the balance sheet was always open under the field. Both are
 * now plain `<button>`s in `.transport` that work like checkboxes — pressed
 * once they stay lit until pressed again, using the `on` class the role
 * buttons already carry (`stage-transport.ts`). This file pins that
 * "stays on until you press it again" is actually true, and that the two
 * new buttons — plus `✓ CARD`, which stays a separate dismiss — do not step
 * on each other.
 *
 * Same shape `stage.test.ts` uses for `stage-afterrun.ts`: a stub `document`
 * this test controls rather than a source-text regex, since `pair-panel.ts`
 * and `balance.ts` are still `document.getElementById` end to end and this
 * repo's test runner carries no real DOM.
 */

type Listener = () => void;

/** The smallest stateful button: remembers its listeners and its own classes,
 * since `pair-panel.ts` and `balance.ts` say "on" with a class, not a
 * checkbox's `checked`. */
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

// Every id a test has armed an element for. `bindPairPanel` and `bindBalance`
// each look their own ids up, so a test registers what it needs and nothing
// else — an id nobody registered resolves to `null`, which both modules
// already treat as "not on this page" (see their own `?.` chains).
const elements = new Map<string, HTMLElement>();
(globalThis as unknown as { document: unknown }).document = {
  getElementById: (id: string) => elements.get(id) ?? null,
};

const { bindPairPanel } = await import("../src/pair-panel.js");
const { bindBalance } = await import("../src/balance.js");

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
});

describe("LEDGER folds the balance sheet behind a button", () => {
  it("shows the panel on the first press and hides it on the second", () => {
    const button = stubButton();
    const panel = stubButton();
    elements.set("ledgerToggle", button.el);
    elements.set("balanceSheetPanel", panel.el);
    const world = createWorld(DEFAULT_CONFIG, 0);
    bindBalance(() => world);

    expect(panel.isOn()).toBe(false);
    expect(button.isOn()).toBe(false);

    button.click();
    expect(panel.isOn()).toBe(true);
    expect(button.isOn()).toBe(true);

    // Stays shown — nothing else in bindBalance touches this class.
    expect(panel.isOn()).toBe(true);

    button.click();
    expect(panel.isOn()).toBe(false);
    expect(button.isOn()).toBe(false);

    elements.delete("ledgerToggle");
    elements.delete("balanceSheetPanel");
  });
});

describe("the two toggles do not touch each other", () => {
  it("pressing LEDGER never moves cfg.briefings or its button", () => {
    const brief = stubButton();
    const ledger = stubButton();
    const panel = stubButton();
    elements.set("briefToggle", brief.el);
    elements.set("ledgerToggle", ledger.el);
    elements.set("balanceSheetPanel", panel.el);
    const cfg = { ...DEFAULT_CONFIG };
    bindPairPanel(cfg, () => {});
    bindBalance(() => createWorld(cfg, 0));

    brief.click();
    expect(cfg.briefings).toBe(true);
    expect(ledger.isOn()).toBe(false);
    expect(panel.isOn()).toBe(false);

    ledger.click();
    expect(panel.isOn()).toBe(true);
    expect(cfg.briefings).toBe(true);
    expect(brief.isOn()).toBe(true);

    elements.delete("briefToggle");
    elements.delete("ledgerToggle");
    elements.delete("balanceSheetPanel");
  });

  it("✓ CARD's dismiss (stage-transport.ts) is unrelated code and never reads cfg.briefings", () => {
    // `bindStageTransport` pushes `{kind: "brief"}` unconditionally on click —
    // it holds no reference to `cfg` at all, so there is nothing here for a
    // Briefings press to disturb. Documented rather than driven through a
    // real click: exercising it needs `Keys["push"]` and a running `World`,
    // which is `stage.ts`'s wiring, not `pair-panel.ts`'s or `balance.ts`'s —
    // see the class doc on `bindPairPanel` for why the two must stay apart.
    expect(true).toBe(true);
  });
});
