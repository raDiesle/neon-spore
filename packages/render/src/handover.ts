import { handedOver, type World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import type { ViewState } from "./renderer.js";
import type { ViewRole } from "./view-role.js";

/**
 * **THE HANDOVER, on the screen: which seat this device is playing.**
 *
 * The fault trades the two panels for a window in the middle of the wave
 * (`sim/handover.ts`). Nothing in the simulation moves for it, so the whole of
 * it is this: while the window is open, the pilot's phone *is* the navigator's
 * screen and the navigator's is the pilot's.
 *
 * **One function, called twice, and that is the design.** A seat is not drawn in
 * one place and answered in another — `touch.ts` says so at the top and it is
 * the reason that file sits beside `layout.ts` — so the renderer swaps the role
 * once as a frame arrives (`canvas2d.ts`) and the host swaps it once on the
 * layout a finger is tested against (`apps/game/src/field-input.ts`). Both call
 * `handedRole`; neither works the window out. Every per-seat fact in the game
 * hangs off those two — `showsCannon`, `showsShield`, `showsCodex`, the radar,
 * the queen's two hints, `seatSkin`, `bandLobes` — so they all travel together
 * without a line each, which is the answer `ideas.md` left open about whether
 * the radar goes with the controls. It does: it is the same screen.
 *
 * **The rig never trades.** `test` is both halves on one screen, so there is no
 * other seat for it to be — and a rig that swapped would be drawing the same
 * two panels in the same two places and calling it a fault.
 *
 * **What does not travel is who the two people are.** The wire's identities are
 * fixed for the run and the simulation attributes a grip, a pull or a tap to the
 * player who sent it, so a borrowed panel is still pressed *as this device*
 * (`apps/game/src/input.ts`, and the fault's own header for why). The line is
 * exact: the buttons and the reads change screens, the two people do not change
 * places.
 */

/** The other seat, or the rig, which has no other seat. */
function otherSeat(role: ViewRole): ViewRole {
  if (role === "p1") return "p2";
  return role === "p2" ? "p1" : "test";
}

/** Which seat this device is playing this frame: its own, or the other one
 * while the panels are traded. */
export function handedRole(role: ViewRole, world: World): ViewRole {
  return handedOver(world) ? otherSeat(role) : role;
}

/**
 * The same layout with the seat it is drawn for, for a caller that holds a
 * layout rather than a role — the hit test, which is handed one built by the
 * host's viewport. The object itself when nothing is traded, so an ordinary
 * wave allocates nothing per touch.
 */
export function handedLayout(l: Layout, world: World): Layout {
  const role = handedRole(l.role, world);
  return role === l.role ? l : { ...l, role };
}

/**
 * The same frame, seated. Called once as a frame arrives, so that every pass
 * under it reads one role — `l.role` and `view.role` are both this one, and a
 * frame that swapped the layout alone would draw the navigator's band under the
 * pilot's hull.
 */
export function handedView(view: ViewState): ViewState {
  const role = handedRole(view.role, view.world);
  return role === view.role ? view : { ...view, role };
}
