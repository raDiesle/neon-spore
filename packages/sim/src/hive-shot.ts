import { hiveBoss, hiveDown, hiveLeft, hiveOpenAt } from "./hive.js";
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
 * **The beam seals like a bolt does.** It has a colour and a column, and
 * the design gives the breach nothing the lance is the sole answer to; a
 * beam standing in an open breach's column in its colour is a bolt held
 * there, and it is judged once, on the tick it burns the column.
 */
export function hiveStruck(world: World, b: Bullet): void {
  const s = hiveBoss(world);
  if (s === null || hiveDown(s)) return;
  const i = hiveOpenAt(s, b.col);
  if (i < 0) {
    world.events.push({ type: "hiveSkin", col: b.col });
    return;
  }
  if (b.color !== s.colors[i]) {
    s.spillBeat -= world.cfg.hiveProvokeBeats;
    world.events.push({ type: "hiveWrong", col: b.col });
    return;
  }
  s.sealed[i] = true;
  const left = hiveLeft(s);
  world.events.push({ type: "hiveSeal", col: b.col, left });
  if (left > 0) return;
  // The last seal is the drama, and it is watched at a third rate.
  s.downBeat = world.beat;
  openSlow(world, world.cfg.hiveSlowBeats);
  world.events.push({ type: "hiveDown", col: b.col });
}
