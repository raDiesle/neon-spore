import { describe, expect, it } from "bun:test";
import { CONFIRM_MS, type ConfirmClock, twoStep } from "../src/confirm.js";

/**
 * LEAVE ROOM drops the other player's game, and did it on one tap from two
 * screens. What is in front of it is a question asked in place — and the rule
 * worth testing is not what it looks like but what reaches the action: only a
 * press on the second, different button, and never the clock.
 *
 * This runner has no DOM, so the deciding half takes its clock as a parameter
 * and the test runs it by hand.
 */

/** A clock the test winds itself. */
function fakeClock(): ConfirmClock & { run: () => void; pending: () => number } {
  const timers = new Map<number, () => void>();
  let next = 1;
  return {
    after: (_ms, run) => {
      const id = next++;
      timers.set(id, run);
      return id;
    },
    cancel: (id) => {
      timers.delete(id);
    },
    run: () => {
      const due = [...timers.values()];
      timers.clear();
      for (const fire of due) fire();
    },
    pending: () => timers.size,
  };
}

function harness() {
  const clock = fakeClock();
  const seen: boolean[] = [];
  let acted = 0;
  const step = twoStep(
    () => {
      acted += 1;
    },
    (armed) => seen.push(armed),
    clock,
  );
  return { clock, step, seen, acted: () => acted };
}

describe("a button that hangs up on somebody else", () => {
  it("does nothing on the first press but ask", () => {
    const h = harness();
    h.step.arm();
    expect(h.acted()).toBe(0);
    expect(h.step.armed()).toBe(true);
    expect(h.seen).toEqual([true]);
  });

  it("acts on the second, different press", () => {
    const h = harness();
    h.step.arm();
    h.step.confirm();
    expect(h.acted()).toBe(1);
    expect(h.step.armed()).toBe(false);
    expect(h.seen).toEqual([true, false]);
  });

  it("never acts from the clock", () => {
    const h = harness();
    h.step.arm();
    h.clock.run();
    expect(h.acted()).toBe(0);
    expect(h.step.armed()).toBe(false);
    expect(h.seen).toEqual([true, false]);
  });

  it("never acts from CANCEL", () => {
    const h = harness();
    h.step.arm();
    h.step.cancel();
    expect(h.acted()).toBe(0);
    expect(h.step.armed()).toBe(false);
  });

  it("cannot be confirmed without having been asked", () => {
    const h = harness();
    h.step.confirm();
    expect(h.acted()).toBe(0);
    expect(h.seen).toEqual([]);
  });

  it("restarts the clock rather than acting when asked twice", () => {
    const h = harness();
    h.step.arm();
    h.step.arm();
    expect(h.acted()).toBe(0);
    expect(h.step.armed()).toBe(true);
    // One press, one repaint: the second `arm` did not turn the state over.
    expect(h.seen).toEqual([true]);
    // And exactly one timer is left standing, not two.
    expect(h.clock.pending()).toBe(1);
  });

  it("is safe to put away when it was never asked", () => {
    const h = harness();
    h.step.cancel();
    h.step.cancel();
    expect(h.seen).toEqual([]);
  });

  it("stands long enough to read and not long enough to forget", () => {
    expect(CONFIRM_MS).toBeGreaterThanOrEqual(2000);
    expect(CONFIRM_MS).toBeLessThanOrEqual(10000);
  });
});

const join = await Bun.file(Bun.fileURLToPath(new URL("../src/join.ts", import.meta.url))).text();
const menu = await Bun.file(Bun.fileURLToPath(new URL("../src/menu.ts", import.meta.url))).text();
const hold = await Bun.file(Bun.fileURLToPath(new URL("../src/hold.ts", import.meta.url))).text();

describe("both doors a player presses while the game is fine", () => {
  it("asks on the room screen", () => {
    expect(join).toContain("bindTwoStep");
  });

  it("asks on the menu", () => {
    expect(menu).toContain("bindTwoStep");
  });

  it("does not ask on the hold card, which answers a line already broken", () => {
    expect(hold).not.toContain("bindTwoStep");
  });
});

const css = await Bun.file(Bun.fileURLToPath(new URL("../src/game.css", import.meta.url))).text();

describe("hidden means hidden", () => {
  it("does not give a hidden element a display that outranks the attribute", () => {
    // `[hidden]`'s own rule is `display: none` at the specificity of one
    // attribute selector, so a plain class beats it and the element is shown
    // whether or not it is hidden. The row asking "SURE?" in front of LEAVE
    // ROOM sat open on the room screen at all times because of exactly that.
    // Both of these are shown and hidden with `el.hidden`.
    expect(css).toContain(".twostep:not([hidden])");
    expect(css).toContain("#joinName:not([hidden])");
  });

  it("still gives the row a display of its own for when it is shown", () => {
    expect(css).toMatch(/\.twostep:not\(\[hidden\]\)\s*\{[^}]*display:\s*flex/);
  });
});
