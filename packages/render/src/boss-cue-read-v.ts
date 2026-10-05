import {
  type HiveState,
  hiveDown,
  hiveOnWall,
  hiveOpen,
  hiveWallFront,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { markAt } from "./boss-cue-frame.js";
import { hiveSite } from "./hive-shape.js";
import type { Layout } from "./layout.js";

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
 * **Nothing for his cannon.** Until 5 October 2026 a `CARRY` / `MOVE` stood
 * on it wherever it was, his, until it reached an open breach. The owner that
 * day: *we do not need to show helper to "move" for cannon to shoot. just the
 * "shoot" indicator is enough where to shoot* — THE PINBALL's verdict on the
 * same word (`boss-cue-read-h.ts`). The open aperture is already lit on his
 * glass, in the colour only he is shown, so a word that said *go* and not
 * *where* told him nothing his screen did not.
 *
 * **`PRESS` / `FIRE` on the breach itself, hers — gated on his cannon, THE
 * SCUTTLE's second rule.** It stands only once `world.cannonCol` already
 * equals the breach's column, which is a fact her own screen already carries
 * (the open aperture, ungreyed by nothing but its colour) — so the mark adds
 * no reading, only the moment. It never says `RED` or `CYAN`: which lobe her
 * thumb presses is the half of the puzzle his voice still has to cross,
 * THE VANE's and THE REPRISE's rule on a boss with two buttons and one word.
 * Two open at once (`hiveTwins`) is the pair's own call, so the reading
 * always names the earliest of the two still open — the one that has been
 * spilling longest — and leaves the choice of which to prioritise a word the
 * pair may still overrule out loud; the cue is a floor, not the whole of the
 * fight. Nothing stands while nothing is open and unsealed (`hiveOpenCount`,
 * folded into the loop below rather than called, since the loop already needs
 * the index and not the count).
 *
 * **Nothing for the swell, the plate or the rocks.** The swell is a warning
 * and not a gesture — nothing on the panel answers it, only a sentence said
 * `hiveSwellBeats` early, THE LEDGER's kind of silence. A rock is the wave's
 * ordinary answer to a rock, warded by the guard and the shield exactly as
 * anywhere else, and a word over it would be the field narrating the wave
 * rather than the boss (`boss-cue-read-t.ts`'s own line about a thrown part).
 */

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
  // A cocoon up a wall behind the lowest one is reached by the pilot's held
  // thumb and not by the column, and from any column but the wall's own,
  // where the bolt would meet the lowest first (`sim/hive-wall.ts`).
  const held = hiveOnWall(s, target) && hiveWallFront(s, col) !== target;
  if (held ? s.aim !== target || world.cannonCol === col : world.cannonCol !== col) return [];
  const c = hiveSite(l, s, target);
  return [markAt(2, "PRESS", "FIRE", c.x, c.y, l, 100)];
}
