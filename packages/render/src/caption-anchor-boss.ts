import type { BossPart } from "@neon-spore/content";
import {
  type HiveState,
  hiveBoss,
  hiveNext,
  hiveOpen,
  hiveSwelling,
  hiveTwins,
  sinewBoss,
  tasterBoss,
  type World,
} from "@neon-spore/sim";
import type { AnchorPoint } from "./caption-anchor.js";
import { bossAnchorB } from "./caption-anchor-boss-b.js";
import { around, box, CLEAR } from "./caption-anchor-box.js";
import { hiveBox, hiveSite, SITE_R } from "./hive-shape.js";
import type { Layout } from "./layout.js";
import { sinewCollarBox } from "./sinew-band.js";
import { tasterFanBox, tasterRidge } from "./taster-draw.js";
import { tasterTallyAt } from "./taster-read.js";
import { showsTasterTally } from "./view-role-clocks.js";
import { showsHiveSwell } from "./view-role-clocks-b.js";

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
  const hive = hiveBoss(world);
  if (hive !== null) return hiveAnchor(l, world, hive, part);
  // The five other bosses with a film: split off on line count.
  return bossAnchorB(l, world, part, beatPhase);
}

/**
 * THE HIVE: the mass, and the two things along its underside a page is about.
 *
 * `breach` rings every site standing open at once, because that is the shape
 * of the problem — one is a column to be in, two are a choice. `swell` is the
 * site about to open and its twin, and it is **no ring at all on the pilot's
 * screen**, which does not draw one (`showsHiveSwell`): the page that says the
 * navigator sees it swell draws the difference instead of claiming it.
 *
 * **Both fall back to the mass rather than to nothing**, because a page whose
 * subject has not arrived yet would otherwise be a page with no words on it —
 * `captionBox` draws nothing without an anchor, and a film's page is read from
 * its first frame, where the breach it is about is usually a beat off. A seat
 * that never draws the part at all is the other case and stays null.
 */
function hiveAnchor(
  l: Layout,
  world: World,
  s: HiveState,
  part: BossPart | undefined,
): AnchorPoint | null {
  const r = SITE_R * l.tile;
  if (part === "swell") {
    if (!showsHiveSwell(l.role)) return null;
    const next = hiveNext(s);
    if (next >= 0 && hiveSwelling(s, world.cfg, world.beat)) {
      const twin = hiveTwins(s, world.cfg) && next + 1 < s.cols.length ? [next + 1] : [];
      return around(
        [next, ...twin].map((i) => hiveSite(l, s, i)),
        r,
      );
    }
  }
  if (part === "breach") {
    const open = [];
    for (let i = 0; i < s.opened; i++) if (hiveOpen(s, i)) open.push(hiveSite(l, s, i));
    const at = around(open, r);
    if (at !== null) return at;
  }
  const b = hiveBox(l, world.cfg);
  return box({
    x: (b.left + b.right) * 0.5,
    y: (b.top + b.bottom) * 0.5,
    rx: (b.right - b.left) * 0.5,
    ry: (b.bottom - b.top) * 0.5,
  });
}
