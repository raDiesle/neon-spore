import { describe, expect, it } from "bun:test";

/**
 * The view switch (P1 / P2 / TEST, top-centre) is a desk affordance, and on a
 * player's phone it was a second seat-picker floating over the field: the
 * menu's seat cards choose the seat now, and the room hands one out, so
 * tapping the other seat here only sends that device's touches nowhere —
 * `view.ts` decides what answers a touch from the mode.
 *
 * There is no DOM in this repo's test runner, so this reads the rule out of
 * the stylesheet the way `input-pc.test.ts` reads wiring out of its source.
 */

const css = await Bun.file(Bun.fileURLToPath(new URL("../src/game.css", import.meta.url))).text();
// The three cards live in `menu-seats.ts` — lifted out of `menu-view.ts` when
// that file reached its length limit, cards, lock and all.
const menuSeats = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-seats.ts", import.meta.url)),
).text();

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
  it("hides the view switch", () => {
    expect(hiddenOnAPlayersDevice()).toContain("body.player-view #viewSwitch");
  });

  it("still hides the three it always did", () => {
    const hidden = hiddenOnAPlayersDevice();
    for (const id of ["#pauseBtn", "#gear", "#waveSkip"]) {
      expect(hidden).toContain(`body.player-view ${id}`);
    }
  });

  it("leaves the desk view reachable, so nothing is stranded", () => {
    // The menu's third seat card is what sets the test view now, and hiding
    // the switch would strand that view if it ever went away.
    expect(menuSeats).toContain('role: "test"');
    expect(menuSeats).toContain("ONE SCREEN");
  });
});
