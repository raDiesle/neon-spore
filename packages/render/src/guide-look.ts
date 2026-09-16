import type { ControlSet, SceneStep } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { drawCaption } from "./guide-caption.js";
import {
  drawGuideNav,
  inside,
  NAV_H,
  type NavButtons,
  type NavState,
  navButtons,
} from "./guide-nav.js";
import { BANNER_H, BANNER_TOP, type CornerPlate, drawGuideCorner } from "./guide-switch.js";
import type { Layout } from "./layout.js";
import type { SeatNames } from "./seat-name.js";

/**
 * The tutorial's furniture, as one record: the band across the top that says
 * TUTORIAL and whose screen this is, the bar the pages are turned by, where
 * that bar's three buttons are, and the words a page writes beside its subject.
 *
 * **It is a seam, and it changes no pixel.** Every one of these was a function
 * called by name — `drawGuideCorner`, `drawGuideNav`, `drawCaption` — and a
 * candidate look for the chrome had nowhere to stand: VERSUS patches *records*
 * for the length of one `draw()` (`docs/versus.md`), and a function import
 * cannot be patched. So the four are read off this object on every call
 * instead, the way the hull reads `OWN_SKIN` and the band's joins read
 * `BAND_JOIN`. The defaults are the shipped functions themselves, so the game
 * draws exactly what it drew.
 *
 * **Geometry travels with the drawing.** `buttons` is on the record beside
 * `nav` because the two are one promise: a thumb is hit-tested against
 * `buttons` (`navHit` below, read by `apps/game/src/briefing.ts`) and the bar
 * draws from it, so a candidate that moves NEXT moves the place NEXT is
 * answered with it — the rule `guide-nav.ts` already keeps for the shipped
 * bar, kept across a patch. `navHeight` is the same promise for the film: it
 * is laid out above the bar (`guide-film.ts`), so a taller bar is a shorter
 * film and not a bar over the panel's last row.
 */
export interface GuideLook {
  /** How tall the bar under a page is; the film is laid out above it. */
  navHeight: number;
  /** The foot of the band plus the slime hanging off it: where the HUD's top
   * rows drop under on a page of film (`guide-scene.ts`). */
  bandFoot: number;
  /** The band across the top of every page of a guide. */
  band: (ctx: CanvasRenderingContext2D, l: Layout, p: CornerPlate) => void;
  /** Where the bar's three are, from the stage alone. Drawn and hit-tested from this. */
  buttons: (l: Layout) => NavButtons;
  /** The bar: BACK, REPLAY, NEXT and the dots. */
  nav: (ctx: CanvasRenderingContext2D, l: Layout, s: NavState) => void;
  /** A page's words, beside the thing they are about. */
  caption: (
    ctx: CanvasRenderingContext2D,
    l: Layout,
    world: World,
    set: ControlSet,
    step: SceneStep,
    tick: number,
    beatPhase: number,
    names?: SeatNames,
  ) => void;
}

/** What ships. Read on every call, never copied. */
export const GUIDE_LOOK: GuideLook = {
  navHeight: NAV_H,
  bandFoot: BANNER_TOP + BANNER_H + 8,
  band: drawGuideCorner,
  buttons: navButtons,
  nav: drawGuideNav,
  caption: drawCaption,
};

/** Which of the bar's three a point is on, or null. `null` on a point outside the bar. */
export function navHit(l: Layout, x: number, y: number): "back" | "replay" | "next" | null {
  const b = GUIDE_LOOK.buttons(l);
  if (inside(b.back, x, y)) return "back";
  if (inside(b.replay, x, y)) return "replay";
  if (inside(b.next, x, y)) return "next";
  return null;
}

/** Whether a point is on the bar at all — a press there is not a press on the field. */
export function onNavBar(l: Layout, y: number): boolean {
  return y >= l.height - GUIDE_LOOK.navHeight;
}
