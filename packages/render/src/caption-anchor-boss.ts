import type { BossPart } from "@neon-spore/content";
import { sinewBoss, tasterBoss, type World } from "@neon-spore/sim";
import type { AnchorPoint } from "./caption-anchor.js";
import { bossAnchorB } from "./caption-anchor-boss-b.js";
import type { Layout } from "./layout.js";
import { sinewCollarBox } from "./sinew-band.js";
import { tasterFanBox, tasterRidge } from "./taster-draw.js";
import { tasterTallyAt } from "./taster-read.js";
import { showsTasterTally } from "./view-role-clocks.js";

/**
 * **Where a boss's own fixture is** — the one anchor `caption-anchor.ts`
 * answers per boss rather than per kind of thing.
 *
 * `SceneAnchor` named bodies, controls, handles, the hull and the strips,
 * and nothing that is a boss's: THE SINEW's film had three pages about the
 * number on the collar round the tendon and pointed them at the hull, because
 * a ring at the nearer handle stood its box over the collar and nothing else
 * was nameable (`docs/queue.md`, 17 September 2026). So `{ at: "boss" }` —
 * with a `part` where a boss draws more than one thing worth a page — and one
 * line per kind here (and in `caption-anchor-boss-b.ts`), each asking the
 * boss's own draw file for the place the
 * way `handle` asks each handle's: the ring cannot land where the fixture is
 * not, and a part a screen does not draw is no ring at all, which is the
 * choir's rule (`choir-anchor.test.ts`).
 */

const CLEAR = 16;

function box(b: { x: number; y: number; rx: number; ry: number }): AnchorPoint {
  return { x: b.x, y: b.y, r: b.ry + 6, rx: b.rx + 6, clear: CLEAR };
}

export function bossAnchor(
  l: Layout,
  world: World,
  part: BossPart | undefined,
  beatPhase: number,
): AnchorPoint | null {
  const sinew = sinewBoss(world);
  if (sinew !== null) {
    // The collar: the zone on one screen, the sum on the other, the same
    // place on both (`sinew-band.ts`).
    return box(sinewCollarBox(l, world.cfg, sinew, world.beat, beatPhase));
  }
  const taster = tasterBoss(world);
  if (taster !== null) {
    if (part === "tally") {
      // The two counts on the ridge — the navigator's, and not drawn on the
      // pilot's screen at all (`taster-read.ts`).
      if (!showsTasterTally(l.role)) return null;
      const { y, thick } = tasterRidge(l, taster, world.cfg, beatPhase);
      const at = tasterTallyAt(l, taster, y, thick);
      return { x: at.x, y: at.y, r: at.size * 0.8, rx: at.size * 1.6, clear: CLEAR };
    }
    // The fan itself, every blade and its edge, on both screens.
    return box(tasterFanBox(l, taster));
  }
  // The five other bosses with a film: split off on line count.
  return bossAnchorB(l, world, part, beatPhase);
}
