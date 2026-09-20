import { describe, expect, test } from "bun:test";
import { createElement } from "../../../tools/test/fake-dom.js";
import { type BackStack, backAnswer, bindBackAsk } from "../src/back-ask.js";
import { type FakeDom, installDom } from "./fake-dom.js";

/**
 * **The gesture that used to leave the page.**
 *
 * The owner, 18 September 2026: *when in game I press back, it should not go
 * back to the previous website, but ask: do you want to go back to the menu or
 * quit the game, or continue playing.* On a handset back is an edge swipe, so
 * what it did was leave a run by accident with the room still open on the
 * other phone.
 *
 * What is pinned here is the half that is easy to get wrong and impossible to
 * see in a frame: **the entry is pushed straight back on every pop**, so the
 * question the gesture opened is also a question the gesture closes, and the
 * gesture still works the hundredth time. That is `confirm.ts`'s own objection
 * to a dialog — *"it steals the back gesture"* — answered rather than skipped.
 */

/** A history stack with no browser under it: what was pushed, and a pop the
 * test performs. `bindBackAsk` takes one so it never touches a global. */
function fakeStack(): BackStack & { pop: () => void; pushed: () => number } {
  const listeners: (() => void)[] = [];
  let count = 0;
  return {
    push: () => {
      count += 1;
    },
    onPop: (fn) => {
      listeners.push(fn);
    },
    pop: () => {
      for (const fn of [...listeners]) fn();
    },
    pushed: () => count,
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
  closedMenu: number;
  quit: number;
  holds: boolean[];
}

function bind(stack: BackStack, inRoom = false, menuOpen = () => false): Heard {
  const heard: Heard = { menu: 0, closedMenu: 0, quit: 0, holds: [] };
  bindBackAsk({
    menuOpen,
    closeMenu: () => {
      heard.closedMenu += 1;
    },
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
  test("parks the player on an entry, so there is something to pop", () => {
    const dom = installDom();
    try {
      card(dom);
      const stack = fakeStack();
      bind(stack);
      expect(stack.pushed()).toBe(1);
      expect(asking(dom)).toBe(false);
    } finally {
      dom.restore();
    }
  });

  test("asks instead of leaving, and holds the field while it asks", () => {
    const dom = installDom();
    try {
      card(dom);
      const stack = fakeStack();
      const heard = bind(stack);
      stack.pop();
      expect(asking(dom)).toBe(true);
      expect(heard.holds).toEqual([true]);
      // The entry is back before anything else happened.
      expect(stack.pushed()).toBe(2);
    } finally {
      dom.restore();
    }
  });

  test("keeps working press after press: the second is CONTINUE PLAYING", () => {
    const dom = installDom();
    try {
      card(dom);
      const stack = fakeStack();
      bind(stack);
      for (let i = 0; i < 4; i++) {
        stack.pop();
        expect(asking(dom)).toBe(true);
        stack.pop();
        expect(asking(dom)).toBe(false);
      }
      // One entry, pushed back every time: nine pops' worth of gesture and no
      // stack that grows.
      expect(stack.pushed()).toBe(9);
    } finally {
      dom.restore();
    }
  });

  test("closes the menu rather than standing a question behind it", () => {
    const dom = installDom();
    try {
      card(dom);
      const stack = fakeStack();
      const heard = bind(stack, false, () => true);
      stack.pop();
      expect(heard.closedMenu).toBe(1);
      expect(asking(dom)).toBe(false);
      expect(stack.pushed()).toBe(2);
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
      stack.pop();
      expect(asking(dom)).toBe(true);
      expect(heard.holds).toEqual([false]);
    } finally {
      dom.restore();
    }
  });
});

describe("what a pop means", () => {
  test("one step out, whatever is on the screen", () => {
    expect(backAnswer(true, false)).toBe("continue");
    // A question already up is answered before the menu behind it is read.
    expect(backAnswer(true, true)).toBe("continue");
    expect(backAnswer(false, true)).toBe("closeMenu");
    expect(backAnswer(false, false)).toBe("ask");
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
