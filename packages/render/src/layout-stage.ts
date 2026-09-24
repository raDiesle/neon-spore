import type { SimConfig } from "@neon-spore/sim";
import { NO_INSET, type Viewport } from "./renderer.js";
import type { ViewRole } from "./view-role.js";

/**
 * **Where the game is drawn, before anything is placed inside it.**
 *
 * Cut out of `layout.ts` when THE WELL's roll needed a field on `Layout` and
 * that page was at its 250-line limit. This is the page's *last* block rather
 * than the one being worked on, which is the rule those pages keep: the rows a
 * lane is adding stay with the comment that explains them.
 *
 * It is one block and not three: the aspect the stage is capped at, the share
 * of the height the band takes, and the rectangle that falls out of the two.
 * Anything that asks where the picture is asks here; `layout.ts` re-exports it
 * so no caller had to learn a second file's name.
 */
/**
 * The phone-shaped rectangle the game is drawn into, centred in the window.
 *
 * The game is portrait mobile web; a desktop window is far wider than that, and
 * a hull drawn across the whole window is not the hull anybody will ever see.
 * So the window is not the stage — this rectangle is, and everything the
 * players are meant to see lives inside it. Only the test chrome, which no
 * player gets, is allowed outside.
 */
export interface Stage {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Widest the stage is allowed to get, width / height. Roughly a 9:16 phone. */
const STAGE_ASPECT = 0.56;
/**
 * **But never capped narrower than this, in CSS pixels** — the widest phone
 * held upright (430, the biggest iPhone). The cap is there so a desk window
 * does not draw a hull nobody will see; a phone's own width is never that, and
 * a phone shorter than 9:16 of free height was being cut to the cap with black
 * at both sides (`computeStage`).
 */
const PHONE_WIDEST = 430;

/**
 * The band is a share of the screen height, and it is the same share in every
 * view. The test view used to take a taller one (`bandPct`, 31 against 19)
 * because it carries both seats' halves — and a taller band leaves less height
 * for the field, so the tile shrank, the stage narrowed to the columns with
 * black at both sides, and the hull stood higher than on either phone. The
 * owner asked on 12 September 2026 that the test view be the game's own
 * dimensions and the game's own ship, always; so both seats' controls now
 * share the band a phone gives one seat (`panel-plan.ts`'s test column), and
 * the stage and the layout ask for that one number before anything is placed.
 */
export function bandHeightFor(height: number, cfg: SimConfig, _role: ViewRole): number {
  return (height * cfg.bandSoloPct) / 100;
}

/**
 * **The phone is the frame, not the columns.** The stage is as wide as the
 * window, never wider than a 9:16 phone of that height — and never capped
 * narrower than `PHONE_WIDEST`, because that cap is there for a desk window
 * and a phone upright is never too wide. The field is `cols * tile`, centred
 * in it (`computeLayout`), and the hull's skin runs past the columns to the
 * stage's sides (`hull.ts`).
 *
 * It was the other way round until 24 September 2026: the stage was never
 * wider than the columns, so a phone shorter than 9:16 of free height — 390x660
 * with its bars out — stood the ship between two black side bars, and the
 * owner saw *the hull skin cut vertically inside the screen*. Asked which
 * should give, the bars, the band or the picture, the owner left it to the
 * lane; the picture gave, because a shorter band shrinks the lobes a thumb
 * aims at on exactly the phones where they are smallest already.
 *
 * **And never out into the phone's own furniture.** `viewport.inset` is the
 * strips the device keeps — the notch and the status bar above, the home
 * indicator or the gesture bar below — and the stage is cut inside them rather
 * than under them. It is done here, once, instead of in `computeLayout`:
 * everything the players touch is placed inside the stage and drawn from its
 * corner, so a stage that has stepped in carries the band, the strips and the
 * lobes in with it, and `bandSoloPct` is a share of the height a thumb is
 * actually allowed rather than of the window's. Nothing was moved by hand.
 */
export function computeStage(viewport: Viewport, _cfg: SimConfig, _role: ViewRole): Stage {
  const inset = viewport.inset ?? NO_INSET;
  // Never negative: a window shorter than its own furniture is what a phone
  // reports for a moment while it rotates, and a negative height reaches the
  // canvas as a negative radius, which throws.
  const height = Math.max(0, viewport.height - inset.top - inset.bottom);
  const across = Math.max(0, viewport.width - inset.left - inset.right);
  // And empty with it: a stage with no height has nothing to be wide for.
  const width = height === 0 ? 0 : Math.min(across, Math.max(height * STAGE_ASPECT, PHONE_WIDEST));
  return { left: inset.left + Math.round((across - width) / 2), top: inset.top, width, height };
}
