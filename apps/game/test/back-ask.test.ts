import { describe, expect, test } from "bun:test";
import { createElement } from "../../../tools/test/fake-dom.js";
import { type BackStack, backAnswer, bindBackAsk, GUARD_DEPTH } from "../src/back-ask.js";
import { type FakeDom, installDom } from "./fake-dom.js";

/**
 * **The gesture that used to leave the page.**
 *
 * The owner, 18 September 2026: *when in game I press back, it should not go
 * back to the previous website, but ask: do you want to go back to the menu or
 * quit the game, or continue playing.* And 29 September 2026: *back first
 * opens the overlay, then back again the game menu, not leave the game.*
 *
 * What is pinned here is the half that is easy to get wrong and impossible to
 * see in a frame: **the entries are pushed from a press, never from a pop**.
 * Chrome skips an entry pushed without the player's own press, so the old
 * push-it-back-on-every-pop left the page on the second back.
 */

/** A history stack with no browser under it: the entries pushed, where the
 * page is on them, and a pop and a press the test performs. */
function fakeStack(): BackStack & {
  pop: () => void;
  press: () => void;
  pushed: () => number;
  /** Whether a pop has gone past the page's own entry — off the site. */
  left: () => boolean;
} {
  const pops: (() => void)[] = [];
  const presses: (() => void)[] = [];
  let at = 0;
  let count = 0;
  let gone = false;
  return {
    depth: () => at,
    push: (depth) => {
      expect(depth).toBe(at + 1);
      at = depth;
      count += 1;
    },
    onPop: (fn) => {
      pops.push(fn);
    },
    onPress: (fn) => {
      presses.push(fn);
    },
    pop: () => {
      if (at === 0) {
        gone = true;
        return;
      }
      at -= 1;
      for (const fn of [...pops]) fn();
    },
    press: () => {
      for (const fn of [...presses]) fn();
    },
    pushed: () => count,
    left: () => gone,
  };
}

/** The card, as `index.html` ships it — the ids the binding reaches for and
 * the three words on the buttons. */
function card(dom: FakeDom): void {
  const root = createElement("div");
  root.id = "backAsk";
  dom.body.append(root);
  for (const [id, label] of [
    ["backMenu", "BACK TO MENU"],
    ["backQuit", "QUIT GAME"],
    ["backStay", "CONTINUE PLAYING"],
  ] as const) {
    const button = createElement("button");
    button.id = id;
    button.textContent = label;
    root.append(button);
  }
}

interface Heard {
  menu: number;
  quit: number;
  holds: boolean[];
}

function bind(stack: BackStack, inRoom = false, menuOpen = () => false): Heard {
  const heard: Heard = { menu: 0, quit: 0, holds: [] };
  bindBackAsk({
    menuOpen,
    openMenu: () => {
      heard.menu += 1;
    },
    quit: () => {
      heard.quit += 1;
    },
    hold: (on) => heard.holds.push(on),
    inRoom: () => inRoom,
    stack,
  });
  return heard;
}

const asking = (dom: FakeDom): boolean => dom.byId("backAsk").classList.contains("on");

describe("the back gesture over a field", () => {
  test("pushes nothing until the player has pressed, then two entries", () => {
    const dom = installDom();
    try {
      card(dom);
      const stack = fakeStack();
      bind(stack);
      expect(stack.pushed()).toBe(0);
      stack.press();
      expect(stack.depth()).toBe(GUARD_DEPTH);
      // A press with the stack already full pushes nothing more.
      stack.press();
      expect(stack.pushed()).toBe(GUARD_DEPTH);
      expect(asking(dom)).toBe(false);
    } finally {
      dom.restore();
    }
  });

  test("asks first, and holds the field while it asks", () => {
    const dom = installDom();
    try {
      card(dom);
      const stack = fakeStack();
      const heard = bind(stack);
      stack.press();
      stack.pop();
      expect(asking(dom)).toBe(true);
      expect(heard.holds).toEqual([true]);
      // Nothing is pushed from a pop: Chrome would skip it.
      expect(stack.pushed()).toBe(GUARD_DEPTH);
    } finally {
      dom.restore();
    }
  });

  test("the second back is the menu, and neither leaves the page", () => {
    const dom = installDom();
    try {
      card(dom);
      const stack = fakeStack();
      const heard = bind(stack);
      stack.press();
      stack.pop();
      stack.pop();
      expect(heard.menu).toBe(1);
      expect(asking(dom)).toBe(false);
      expect(heard.holds).toEqual([true, false]);
      expect(stack.left()).toBe(false);
    } finally {
      dom.restore();
    }
  });

  test("a press puts the spent entries back, so it works the hundredth time", () => {
    const dom = installDom();
    try {
      card(dom);
      const stack = fakeStack();
      const heard = bind(stack);
      for (let i = 0; i < 100; i++) {
        stack.press();
        stack.pop();
        expect(asking(dom)).toBe(true);
        dom.byId("backStay").click();
        expect(asking(dom)).toBe(false);
      }
      expect(heard.menu).toBe(0);
      expect(stack.left()).toBe(false);
      // One entry spent and one put back each time: the stack never grows.
      expect(stack.depth()).toBe(GUARD_DEPTH - 1);
    } finally {
      dom.restore();
    }
  });

  test("a pop over the menu stays on the menu", () => {
    const dom = installDom();
    try {
      card(dom);
      const stack = fakeStack();
      const heard = bind(stack, false, () => true);
      stack.press();
      stack.pop();
      expect(heard.menu).toBe(0);
      expect(asking(dom)).toBe(false);
    } finally {
      dom.restore();
    }
  });

  test("its three answers are three different things", () => {
    for (const [id, want] of [
      ["backMenu", "menu"],
      ["backQuit", "quit"],
      ["backStay", "stay"],
    ] as const) {
      const dom = installDom();
      try {
        card(dom);
        const stack = fakeStack();
        const heard = bind(stack);
        stack.press();
        stack.pop();
        dom.byId(id).click();
        // Every answer puts the question away and takes the hold off with it.
        expect(asking(dom)).toBe(false);
        expect(heard.holds).toEqual([true, false]);
        expect(heard.menu).toBe(want === "menu" ? 1 : 0);
        expect(heard.quit).toBe(want === "quit" ? 1 : 0);
      } finally {
        dom.restore();
      }
    }
  });

  /**
   * The tick is the pair's shared clock, and one device halting it is not a
   * pause but a stall the other phone reads as a fault — the menu keeps the
   * same rule for the same reason (`menu.ts`).
   */
  test("does not stop a world two phones are sharing", () => {
    const dom = installDom();
    try {
      card(dom);
      const stack = fakeStack();
      const heard = bind(stack, true);
      stack.press();
      stack.pop();
      expect(asking(dom)).toBe(true);
      expect(heard.holds).toEqual([false]);
    } finally {
      dom.restore();
    }
  });
});

describe("what a pop means", () => {
  test("one screen further out: the question, then the menu, then no further", () => {
    expect(backAnswer(false, false)).toBe("ask");
    // A question already up is answered before the menu behind it is read.
    expect(backAnswer(true, false)).toBe("menu");
    expect(backAnswer(true, true)).toBe("menu");
    expect(backAnswer(false, true)).toBe("stay");
  });
});

const html = await Bun.file(Bun.fileURLToPath(new URL("../index.html", import.meta.url))).text();

describe("the card the page ships", () => {
  test("carries the ids the binding reaches for", () => {
    for (const id of ["backAsk", "backMenu", "backQuit", "backStay"]) {
      expect(html).toContain(`id="${id}"`);
    }
  });

  test("says the owner's own three answers", () => {
    for (const word of ["BACK TO MENU", "QUIT GAME", "CONTINUE PLAYING"]) {
      expect(html).toContain(word);
    }
  });
});
