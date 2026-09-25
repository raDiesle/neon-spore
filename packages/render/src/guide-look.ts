import type { ControlSet, SceneStep } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { inside, type NavBox, type NavButtons, type NavState } from "./guide-nav.js";
import type { CornerPlate } from "./guide-switch.js";
import { BAND_FOOT, band } from "./guide-tide.js";
import { buttons, NAV_HEIGHT, nav, stepBoxes } from "./guide-tide-bar.js";
import { caption } from "./guide-tide-caption.js";
import type { Layout } from "./layout.js";
import type { SeatNames } from "./seat-name.js";

/**
 * The tutorial's furniture, as one record: the band across the top that says
 * TUTORIAL and whose screen this is, the bar the pages are turned by, where
 * that bar's four buttons are, and the words a page writes beside its subject.
 *
 * **It is a seam.** Every one of these was a function called by name, and a
 * candidate look for the chrome had nowhere to stand: VERSUS patches *records*
 * for the length of one `draw()` (`docs/versus.md`), and a function import
 * cannot be patched. So the four are read off this object on every call
 * instead, the way the hull reads `OWN_SKIN` and the band's joins read
 * `BAND_JOIN`.
 *
 * **What it holds today is TIDE**, taken by the owner on 16 September 2026 out
 * of the six `guide:chrome` was opened with (`tools/versus/DECIDED.md`). The
 * chrome that shipped before it — a grown plate across the top, a bar of three
 * round buttons and a caption in a bubble — is gone rather than kept behind a
 * flag: the record is the seam, and a second answer arrives as a candidate.
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
  /** Where the bar's four are, from the stage alone. Drawn and hit-tested from this. */
  buttons: (l: Layout) => NavButtons;
  /** Where the row of step marks is, one box per page, in page order. The
   * same promise as `buttons`: the row is drawn from it and pressed on it. */
  steps: (l: Layout, pages: number) => NavBox[];
  /** The bar: BACK, REPLAY, NEXT, SKIP and the dots. */
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
  navHeight: NAV_HEIGHT,
  bandFoot: BAND_FOOT,
  band,
  buttons,
  steps: stepBoxes,
  nav,
  caption,
};

/** The bar's four, by name. */
export type NavHit = "back" | "replay" | "next" | "skip";

/** Which of the bar's four a point is on, or null. `null` on a point outside the bar. */
export function navHit(l: Layout, x: number, y: number): NavHit | null {
  const b = GUIDE_LOOK.buttons(l);
  if (inside(b.back, x, y)) return "back";
  if (inside(b.replay, x, y)) return "replay";
  if (inside(b.next, x, y)) return "next";
  if (inside(b.skip, x, y)) return "skip";
  return null;
}

/**
 * How far outside the row of marks a thumb still counts as on it.
 *
 * A mark is five pixels tall and as little as nine wide, which is a thing to
 * count and not a thing to hit, so the row is opened out to a strip a thumb
 * can find. Nothing else lives in the bar's top strip — NEXT starts
 * twenty-six pixels down and is asked first (`navHit`), so the pad can be
 * generous in the one direction that matters.
 */
const STEP_PAD = { x: 6, y: 12 };

/**
 * Which step a press on the row is asking for, or null off the row.
 *
 * **Nearest mark rather than the one under the point**, because the marks are
 * thinner than the gaps between them on a guide with many pages: a press that
 * lands between two marks meant one of them, and refusing it would make the
 * row feel broken in exactly the places it is hardest to hit. The strip the
 * row answers on is its own marks opened out by `STEP_PAD` and no further,
 * so the rest of the bar still falls through to the buttons.
 *
 * The owner asked for it on 20 September 2026: *clicking on the golden lines
 * indicating the current step… is an alternative to navigate the guide
 * besides the existing buttons.* What a press means is `apps/game/src/
 * briefing.ts`'s — a page is turned one at a time over the wire, so a mark
 * three pages back is three turns (`sim/guide-steps.ts`).
 */
export function navStepHit(l: Layout, pages: number, x: number, y: number): number | null {
  const boxes = GUIDE_LOOK.steps(l, pages);
  const first = boxes[0];
  const last = boxes[boxes.length - 1];
  if (!first || !last) return null;
  if (x < first.x - STEP_PAD.x || x > last.x + last.w + STEP_PAD.x) return null;
  if (y < first.y - STEP_PAD.y || y > first.y + first.h + STEP_PAD.y) return null;
  let best = 0;
  let near = Number.POSITIVE_INFINITY;
  for (const [i, box] of boxes.entries()) {
    const d = Math.abs(x - (box.x + box.w / 2));
    if (d < near) {
      near = d;
      best = i;
    }
  }
  return best;
}

/** Whether a point is on the bar at all — a press there is not a press on the field. */
export function onNavBar(l: Layout, y: number): boolean {
  return y >= l.height - GUIDE_LOOK.navHeight;
}
