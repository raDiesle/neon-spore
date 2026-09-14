import { DIFFICULTIES } from "@neon-spore/sim";
import { bindTwoStep, type TwoStep } from "./confirm.js";
import type { MenuBindings } from "./menu-bindings.js";
import type { MenuDom } from "./menu-view.js";

/**
 * The questions the menu asks in place (`confirm.ts`): LEAVE ROOM's, and the
 * one in front of each difficulty. Bound here rather than in `menu.ts` so the
 * menu's own closure stays under the limit; what it keeps is the two moments
 * a question is put away again — every way off the page, and the room going
 * away under LEAVE ROOM — which are `cancel` and `cancelLeave`.
 */
export interface MenuSteps {
  /** Every question, put away: any way off the page it was asked on. */
  cancel(): void;
  /**
   * LEAVE ROOM's question alone. The entry goes off with the room, and the
   * question has to go with it, because the row is the entry's sibling rather
   * than its child.
   */
  cancelLeave(): void;
}

/**
 * LEAVE ROOM drops the other player's game, so it asks in place first. Both
 * doors to it get the same two-step; the hold card's own LEAVE ROOM does
 * not, because that one answers a line that is already broken.
 */
export function bindMenuSteps(dom: MenuDom, b: MenuBindings): MenuSteps {
  /**
   * LEAVE ROOM's question, once the page it sits on exists. Held here because
   * every way off this page puts it away again: a question that outlives the
   * screen it was asked on is a yes waiting to be pressed by accident.
   */
  let leaveStep: TwoStep | undefined;

  const leaveEntry = dom.entryRoot("leave");
  if (leaveEntry) {
    leaveStep = bindTwoStep(leaveEntry, "LEAVE", () => {
      b.leaveRoom();
      dom.show("root");
    });
  }

  /**
   * The three difficulties, each behind the question LEAVE ROOM is behind:
   * changing the level takes the run back to the first wave (`progress.ts`), so
   * a row that acted on one press would be a wave count lost to a thumb landing
   * while the page was still arriving.
   */
  const levelSteps: TwoStep[] = [];
  for (const level of DIFFICULTIES) {
    const row = dom.entryRoot(level);
    if (!row) continue;
    levelSteps.push(
      bindTwoStep(row, "START AGAIN", () => {
        if (level !== b.level()) b.setLevel(level);
        dom.show("play");
      }),
    );
  }

  return {
    cancel: () => {
      leaveStep?.cancel();
      for (const step of levelSteps) step.cancel();
    },
    cancelLeave: () => leaveStep?.cancel(),
  };
}
