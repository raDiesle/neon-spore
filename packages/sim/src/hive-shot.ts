import { midCol } from "./config.js";
import { hiveBoss, hiveDown, hiveLeft, hiveOpenAt, hiveSealedCount } from "./hive.js";
import { hiveClenched, hiveSealedBy } from "./hive-lobe.js";
import { enterHivePhase } from "./hive-step.js";
import { openSlow } from "./slow.js";
import type { Bullet } from "./types.js";
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
 */
export function hiveStruck(world: World, b: Bullet): void {
  const s = hiveBoss(world);
  if (s === null || hiveDown(s)) return;
  const i = hiveClenched(s) ? -1 : hiveOpenAt(s, b.col);
  if (i < 0) {
    world.events.push({ type: "hiveSkin", col: b.col });
    return;
  }
  if (!hiveSealedBy(s, i, b.color)) {
    s.spillBeat -= world.cfg.hiveProvokeBeats;
    world.events.push({ type: "hiveWrong", col: b.col });
    return;
  }
  s.sealed[i] = true;
  const left = hiveLeft(s);
  world.events.push({ type: "hiveSeal", col: b.col, left });
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
  openSlow(world, world.cfg.hiveSlowBeats);
  world.events.push({ type: "hiveDown", col: b.col });
}
