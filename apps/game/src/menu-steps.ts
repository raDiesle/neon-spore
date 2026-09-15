import { bindTwoStep, type TwoStep } from "./confirm.js";
import type { MenuBindings } from "./menu-bindings.js";
import type { MenuDom } from "./menu-view.js";

/**
 * The question the menu asks in place (`confirm.ts`): LEAVE ROOM's. Bound here
 * rather than in `menu.ts` so the menu's own closure stays under the limit;
 * what it keeps is the two moments a question is put away again — every way off
 * the page, and the room going away under LEAVE ROOM — which are `cancel` and
 * `cancelLeave`.
 *
 * It asked one in front of each difficulty too, until 15 September 2026: the
 * three tempi came off the menu with the gear on a partner's row, because a
 * game that already exists does not change its difficulty (`menu-entries.ts`).
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

  return {
    cancel: () => leaveStep?.cancel(),
    cancelLeave: () => leaveStep?.cancel(),
  };
}
