import { type HiveState, hiveDown, hiveOpen, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { hiveSite } from "./hive-shape.js";
import { type Layout, tileCX } from "./layout.js";

/**
 * **What THE HIVE is asking for** — the readings' page `v`, a letter rather
 * than the next free number for `boss-cue-read-s.ts`'s own reason: this page
 * and the boss-cue-read-c.ts split were both written the same day, and a
 * number here would be a number about whichever of the two landed first.
 *
 * **THE SCUTTLE's shape, not THE WELL's.** Both breach and socket are a
 * column and a colour one seat cannot see, but where THE SCUTTLE's live
 * socket is the navigator's own picture and nothing on the pilot's screen
 * (`showsScuttleLive`, `boss-cue-read-t.ts`), **an open breach stands in the
 * same place on both screens** — the mass and every site along it are drawn
 * with no `showsX` anywhere near their position (`hive-shape.ts`'s own header:
 * *nothing here is per seat*). Only the colour *inside* the aperture is
 * split (`showsHiveColor`, `hive-draw.ts`). So the column this fight moves on
 * is not the secret; the two secrets are the colour, his alone, and the next
 * site's swell, hers alone (`hive.ts` §11.14) — and a cue that named either
 * would be the conversation the wave exists to cause.
 *
 * **`CARRY` / `MOVE` on the cannon where it stands, his — THE SCUTTLE's and
 * THE REPRISE's mark, not a new one.** It says his thumb has a breach to
 * reach and nothing about which one or which way: the destination is the
 * open, unsealed aperture already lit on his own glass, in the colour only he
 * is shown. Two open at once (`hiveTwins`) is the pair's own call, so the
 * reading always names the earliest of the two still open — the one that has
 * been spilling longest — and leaves the choice of which to prioritise a
 * word the pair may still overrule out loud; the cue is a floor, not the
 * whole of the fight.
 *
 * **`PRESS` / `FIRE` on the breach itself, hers — gated on his cannon, THE
 * SCUTTLE's second rule.** It stands only once `world.cannonCol` already
 * equals the breach's column, which is a fact her own screen already carries
 * (the open aperture, ungreyed by nothing but its colour) — so the mark adds
 * no reading, only the moment. It never says `RED` or `CYAN`: which lobe her
 * thumb presses is the half of the puzzle his voice still has to cross,
 * THE VANE's and THE REPRISE's rule on a boss with two buttons and one word.
 *
 * **One at a time, and never both.** Unlike THE REPRISE's tear, which stands
 * for a pilot and a navigator to act on together, a breach takes its two
 * halves in order — reach it, then fire it — so the two marks never share a
 * frame: `PRESS` replaces `CARRY` the instant the cannon arrives, and neither
 * appears while nothing stands open and unsealed (`hiveOpenCount`, folded
 * into the loop below rather than called, since the loop already needs the
 * index and not the count).
 *
 * **Nothing for the swell, the plate or the rocks.** The swell is a warning
 * and not a gesture — nothing on the panel answers it, only a sentence said
 * `hiveSwellBeats` early, THE LEDGER's kind of silence. A rock is the wave's
 * ordinary answer to a rock, warded by the guard and the shield exactly as
 * anywhere else, and a word over it would be the field narrating the wave
 * rather than the boss (`boss-cue-read-t.ts`'s own line about a thrown part).
 */

/** THE CHOIR's frame, in tiles: the size of every mark on this page. */
const HALF_W = 0.72;
const HALF_H = 0.66;

function markAt(
  seat: BossCue["seat"],
  kind: BossCue["kind"],
  word: string,
  x: number,
  y: number,
  l: Layout,
  seed: number,
): BossCue {
  return { seat, kind, word, x, y, halfW: l.tile * HALF_W, halfH: l.tile * HALF_H, seed };
}

export function hiveCues(l: Layout, world: World, s: HiveState): readonly BossCue[] {
  if (hiveDown(s)) return [];
  let target = -1;
  for (let i = 0; i < s.opened; i++) {
    if (hiveOpen(s, i)) {
      target = i;
      break;
    }
  }
  if (target < 0) return [];
  const col = s.cols[target] ?? 0;
  if (world.cannonCol === col) {
    const c = hiveSite(l, s, target);
    return [markAt(2, "PRESS", "FIRE", c.x, c.y, l, 100)];
  }
  return [markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 99)];
}
