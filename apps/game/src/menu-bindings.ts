import type { MechanicId } from "@neon-spore/content";
import type { LinkStatus } from "@neon-spore/net";
import type { ViewRole } from "@neon-spore/render";
import type { DemoRow } from "./demo-menu.js";
import type { MenuPage } from "./menu-parts.js";
import type { SettingsHooks } from "./menu-settings.js";
import type { RunState } from "./run-state.js";

/**
 * **What the menu is handed, and what it hands back.**
 *
 * Split out of `menu.ts` when the front page became four rows and that file
 * reached its length limit, along the seam `input-bindings.ts` was cut on one
 * knot over: this is a *shape*, and next door is the thing that reads one.
 * Every field on it arrived with a paragraph saying why the menu cannot work it
 * out for itself — the half a reader scrolls past — and none of them is a
 * decision this file makes.
 *
 * Both names are re-exported from `menu.ts`, so nothing that already reached
 * for a `MenuBindings` or a `MainMenu` through that file had to move.
 */

export interface MenuBindings {
  jumpToWave: (wave: number) => void;
  /** The four holds. The menu owns exactly one of them, and only when solo. */
  run: RunState;
  /** The wave the field is on, for CONTINUE's line while one is open. */
  wave: () => number;
  /** The seat the view switch is on, and the way to move it. */
  seat: () => ViewRole;
  setSeat: (role: ViewRole) => void;
  openRoom: () => void;
  /** Join a room by code, with the room screen showing it. */
  joinRoom: (room: string) => void;
  /** Hang up: back to one device, both seats, and the menu. */
  leaveRoom: () => void;
  openTuning: () => void;
  /**
   * This seat is ready — the room's own START, sent by CONTINUE when there is a
   * room and nothing has been played in it yet. The room starts both devices
   * once the other seat says so too (`link.ts`), which is the only way a press
   * on one phone may begin a wave on two.
   */
  ready: () => void;
  /** Show the six pages that say what this game is, and put the menu back
   * afterwards. */
  openIntro: (back: () => void) => void;
  /** What the settings page needs of the rest of the app — see `menu-settings.ts`. */
  settings: SettingsHooks;
  /** One row per mechanic — see `demo-menu.ts`. */
  demos: DemoRow[];
  /** Switches the run to the demonstration's config and opens its wave. */
  openDemo: (id: MechanicId) => void;
}

export interface MainMenu {
  /** Open it, on the front page or on a page named — the desync opens it on
   * PLAY, where the row that answers a parted run is (`shell.ts`). */
  open: (page?: MenuPage) => void;
  close: () => void;
  isOpen: () => boolean;
  /** The link changed. The room line, the LEAVE entry and the seat lock follow it. */
  update: (status: LinkStatus) => void;
}
