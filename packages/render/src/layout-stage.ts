import type { SimConfig } from "@neon-spore/sim";
import type { Viewport } from "./renderer.js";
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
 * The columns are the frame, not the phone. The hull is exactly as wide as the
 * field and is clipped to it, so any stage wider than the columns shows empty
 * background beside the ship — and it changes width with the band, which is why
 * the gap used to move when the view switched. The tile is whatever the height
 * leaves; the stage is that many columns wide, and never wider than a phone or
 * than the window.
 */
export function computeStage(viewport: Viewport, cfg: SimConfig, role: ViewRole): Stage {
  const height = viewport.height;
  const usable = height - bandHeightFor(height, cfg, role) - cfg.radarHeightPx;
  const tile = Math.max(0, usable / cfg.rows);
  const width = Math.min(viewport.width, height * STAGE_ASPECT, cfg.cols * tile);
  return { left: Math.round((viewport.width - width) / 2), top: 0, width, height };
}
