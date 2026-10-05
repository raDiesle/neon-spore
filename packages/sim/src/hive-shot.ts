import { midCol } from "./config.js";
import type { CoreVerdict } from "./core-verdict.js";
import {
  type HiveState,
  hiveBoss,
  hiveDown,
  hiveEventRow,
  hiveLeft,
  hiveOpen,
  hiveOpenAt,
  hiveSealedCount,
} from "./hive.js";
import { hiveClenched, hiveSealedBy } from "./hive-lobe.js";
import { enterHivePhase } from "./hive-step.js";
import { hiveWallFront, hiveWallMet } from "./hive-wall.js";
import { openSlow } from "./slow.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **A shot that nothing on the field stopped, leaving through the top** under
 * THE HIVE. Called by `bullets.ts` and `lance-burn.ts` beside
 * `scuttleStruck`, and a no-op unless THE HIVE is the boss.
 *
 * Its own file beside `hive-step.ts` for `lead-shot.ts`' reason: next door
 * is the fight's **clock**, and this happens on the **tick**, where a bolt
 * leaves the field. The judgment is the whole of it — a bolt in an open
 * breach's column and its colour seals it for good; the other colour
 * provokes the body, and every open breach spills `hiveProvokeBeats`
 * sooner; any column with no open breach over it is skin, said and
 * nothing. The spilled body (`hive-step.ts`) stops a bolt before it gets
 * here same as any coloured creature does — a matching shot kills it and
 * is spent doing so, so a breach takes two shots to seal: one to clear
 * the column, one to reach the top. Both have to land inside the one
 * cadence before the next body falls, and the pair that lets three open
 * has three cadences to find the gap in.
 *
 * **A clenched underside is out of the bolt's reach too**, not only the
 * thumb's: every column is skin while the mass is up, so the pair that
 * leaves a clench standing is not merely waiting — they cannot hurt it, and
 * the one answer to it is the pilot's hand on the picture
 * (`hive-hand.ts`). **And a lobe wrung open takes either colour**, which is
 * the navigator's gesture spending itself here.
 *
 * **The beam seals like a bolt does.** It has a colour and a column, and
 * the design gives the breach nothing the lance is the sole answer to; a
 * beam standing in an open breach's column in its colour is a bolt held
 * there, and it is judged once, on the tick it burns the column.
 *
 * What it says of a bolt is `hiveVerdict`, which the picture asks too.
 */
export function hiveStruck(world: World, b: Bullet): boolean {
  const s = hiveBoss(world);
  if (s === null || hiveDown(s)) return false;
  hiveJudge(world, s, hiveOpenAt(s, b.col), b.col, b.color);
  return true;
}

/**
 * A shot that met a cocoon on a wall, once `hiveWallAlong` has said one was
 * in its way (`boss-along.ts`) — the lowest in the column for a bolt fired
 * straight up, the held one for a bolt the pilot's thumb steered round the
 * corner into it (`hive-wall.ts`). Judged exactly as a bolt out of the top
 * is, by the site it met.
 */
export function hiveWallStruck(world: World, b: Bullet): void {
  const s = hiveBoss(world);
  if (s === null || hiveDown(s)) return;
  const i = hiveWallMet(s, b);
  hiveJudge(world, s, i >= 0 && hiveOpen(s, i) ? i : -1, b.col, b.color, i);
}

/**
 * What a shot of `color` does to open site `i` — or, with `-1`, to skin, a
 * scar or a shut cocoon — said at `col` and, for a wall's, at the row of the
 * cocoon it met (`at`, which is `i` when that one is open).
 */
function hiveJudge(world: World, s: HiveState, i: number, col: number, color: Color, at = i): void {
  const row = at >= 0 ? hiveEventRow(s, at) : {};
  const verdict = siteVerdict(s, i, color);
  if (verdict === "armour") {
    world.events.push({ type: "hiveSkin", col, ...row });
    return;
  }
  if (verdict === "wrong") {
    s.spillBeat -= world.cfg.hiveProvokeBeats;
    world.events.push({ type: "hiveWrong", col, ...row });
    return;
  }
  s.sealed[i] = true;
  const left = hiveLeft(s);
  world.events.push({ type: "hiveSeal", col, left, ...row });
  if (left > 0) {
    // Hurt on a count rather than on a clock: the underside draws up out of
    // reach on every `hiveClenchEvery`-th scar, and the openings go on
    // arriving behind it (`hive-step.ts`).
    if (hiveSealedCount(s) % world.cfg.hiveClenchEvery !== 0) return;
    s.haulMilli = 0;
    enterHivePhase(s, "clench", world.beat);
    world.events.push({ type: "hiveClench", col: midCol(world.cfg) });
    return;
  }
  // The last seal is the drama, and it is watched at the slow rate.
  s.downBeat = world.beat;
  enterHivePhase(s, "down", world.beat);
  openSlow(world, world.cfg.hiveSlowBeats, "show");
  world.events.push({ type: "hiveDown", col, ...row });
}

/**
 * What a bolt of `color` in `col` meets, in `CoreVerdict`'s words: an open
 * breach in its colour (`"target"`) or the other (`"wrong"`, the body
 * provoked), or the skin (`"armour"`) anywhere else — the underside spans
 * the field, so every bolt meets it (`shot-out.ts`).
 */
export function hiveVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = hiveBoss(world);
  if (s === null || hiveDown(s)) return null;
  return siteVerdict(s, hiveOpenAt(s, col), color);
}

/**
 * What a bolt of `color` fired straight up `col` meets on a wall: the lowest
 * cocoon on it (`hiveWallFront`), in the same words — or null for a column
 * with no wall in it, or a beaten mass. The picture asks it where the bolt
 * is drawn stopping (`render/hive-stop.ts`).
 */
export function hiveWallVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = hiveBoss(world);
  if (s === null || hiveDown(s)) return null;
  const i = hiveWallFront(s, col);
  if (i < 0) return null;
  return siteVerdict(s, hiveOpen(s, i) ? i : -1, color);
}

/** What a shot of `color` does to open site `i`, or to skin with `-1`; a clenched mass is skin everywhere. */
function siteVerdict(s: HiveState, i: number, color: Color): "armour" | "target" | "wrong" {
  if (hiveClenched(s) || i < 0) return "armour";
  return hiveSealedBy(s, i, color) ? "target" : "wrong";
}
