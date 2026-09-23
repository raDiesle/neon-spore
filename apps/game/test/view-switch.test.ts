import { describe, expect, it } from "bun:test";
import { SCREEN_WORDS } from "@neon-spore/content";
import { roomHasTheSeat } from "../src/view.js";
import { installDom } from "./fake-dom.js";

/**
 * The view switch (P1 / P2 / TEST, top-centre) is a desk affordance, and on a
 * player's phone it was a second seat-picker floating over the field: a room
 * deals the seat, so tapping the other one here only sends that device's
 * touches nowhere — `view.ts` decides what answers a touch from the mode.
 *
 * **So the room takes it away, and not the view.** It went with the rig on 3
 * September 2026, and that made P1 a door that locked behind whoever walked
 * through it: the switch was the fourth thing P1 took away, and the seat cards
 * left as the way back are on the rig page, which opens on three presses of the
 * spore with nothing on the screen saying so (`menu-view.ts`). The owner, 18
 * September 2026: *when I switch in game test view to p1, I cannot switch back
 * to test again.* Solo at a desk the switch stands in every view; in a room it
 * goes, and LEAVE ROOM on the menu's front page is the way out of that.
 *
 * The rule is a stylesheet and the wiring is one line of `shell.ts`, so this
 * reads both out of their source the way `input-pc.test.ts` does. What it can
 * run is the body class itself, which is the whole of `roomHasTheSeat`.
 */

const src = (name: string): Promise<string> =>
  Bun.file(Bun.fileURLToPath(new URL(`../src/${name}`, import.meta.url))).text();

const css = await src("game.css");
const shell = await src("shell.ts");
// The three cards live in `menu-seats.ts` — lifted out of `menu-view.ts` when
// that file reached its length limit, cards, lock and all.
const menuSeats = await src("menu-seats.ts");

/** The one `body.player-view { display: none }` block, as a list of selectors. */
function hiddenOnAPlayersDevice(): string[] {
  const block = /((?:body\.player-view\s+#[\w-]+,?\s*)+)\{\s*display:\s*none;\s*\}/.exec(css);
  if (block === null) throw new Error("no body.player-view display:none rule in game.css");
  return (block[1] ?? "")
    .split(",")
    .map((selector) => selector.trim())
    .filter(Boolean);
}

describe("a player's device carries no test rig", () => {
  it("still hides the three it always did", () => {
    const hidden = hiddenOnAPlayersDevice();
    for (const id of ["#pauseBtn", "#gear", "#waveSkip"]) {
      expect(hidden).toContain(`body.player-view ${id}`);
    }
  });

  it("does not hide the switch, which is the way back off a seat", () => {
    expect(hiddenOnAPlayersDevice()).not.toContain("body.player-view #viewSwitch");
  });
});

describe("the room is what takes the view switch away", () => {
  it("hides it under the room's own class", () => {
    expect(css).toContain("body.in-room #viewSwitch {");
  });

  it("hides it from one place, so there is one reason it can go", () => {
    // A second selector taking it off would be a second reason, and the
    // fortnight in the essay above is what a second reason cost last time.
    const hiders = css.match(/^[^\n@{}]*#viewSwitch[^\n{]*\{/gm) ?? [];
    expect(hiders.filter((r) => /body\.[\w-]+/.test(r))).toEqual(["body.in-room #viewSwitch {"]);
  });

  it("is told off every status the room sends", () => {
    expect(shell).toContain('roomHasTheSeat(status.state !== "solo")');
  });

  it("puts the class on the body and takes it off again", () => {
    const dom = installDom();
    try {
      roomHasTheSeat(true);
      expect(dom.body.classList.contains("in-room")).toBe(true);
      roomHasTheSeat(false);
      expect(dom.body.classList.contains("in-room")).toBe(false);
    } finally {
      dom.restore();
    }
  });
});

describe("the desk view is reachable either way", () => {
  it("keeps the menu's third seat card", () => {
    // Behind three presses on the spore, which is why it cannot be the only way
    // back — but it is still a way, and it is how a room's seat is left.
    expect(menuSeats).toContain('role: "test"');
    expect(menuSeats).toContain("...SCREEN_WORDS.test");
    expect(SCREEN_WORDS.test.name).toBe("ONE SCREEN");
  });
});
