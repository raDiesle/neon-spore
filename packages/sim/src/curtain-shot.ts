import { metColor, missedColor } from "./balance.js";
import { curtainBody, curtainBoss, curtainCoreBare } from "./curtain.js";
import { curtainDrift, curtainFire, curtainLobeOff, enterCurtain } from "./curtain-step.js";
import { creatureLane } from "./mid-beat.js";
import type { Bullet, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * The two moments a shot meets THE CURTAIN, both on the **tick**: a bolt
 * into the fabric, from the refuse path (`bullet-refused.ts`), and a shot
 * leaving the top of the core's column while the core is bare, from
 * `bullets.ts` and `lance-burn.ts` beside `gorgeStruck`. The beat's work is
 * `curtain-step.ts`; this file is split off it at the 250-line limit, along
 * the one seam the two halves already had.
 */

/**
 * **A bolt into the fabric**, from the refuse path (`bullet-refused.ts`).
 * A soft lobe in that column comes off; anything else is cloth, and the
 * shot is spent on it with nothing to show but a bounce.
 */
export function curtainHemStruck(world: World, b: Bullet, hit: Creature): void {
  const c = curtainBoss(world);
  const i = b.col - creatureLane(world, hit);
  if (c !== null && c.creatureId === hit.id && c.lobes[i] && c.soft.includes(i)) {
    metColor(world);
    curtainLobeOff(world, c, hit, i);
    return;
  }
  world.events.push({ type: "bounce", col: b.col, row: hit.row, color: b.color });
}

/**
 * **A shot that nothing on the field stopped, leaving through the top** of
 * the core's column while the core is bare. Its own colour hurts it: the
 * lobe nearest it drops, it drifts, and the rail jams behind it. The other
 * colour is answered with a rock down the column at once.
 */
export function curtainStruck(world: World, b: Bullet): void {
  const c = curtainBoss(world);
  if (c === null || c.phase === "out" || b.col !== c.coreCol) return;
  if (!curtainCoreBare(world, c)) return;
  if (b.color !== c.coreColor) {
    missedColor(world);
    curtainFire(world, c);
    return;
  }
  metColor(world);
  c.coreHits += 1;
  const left = world.cfg.curtainCoreHits - c.coreHits;
  world.events.push({ type: "curtainCoreHit", col: c.coreCol, left });
  if (left <= 0) {
    enterCurtain(world, c, "out");
    world.events.push({ type: "curtainOut", col: c.coreCol });
    return;
  }
  const body = curtainBody(world, c);
  if (body !== undefined) {
    let nearest = -1;
    for (let i = 0; i < c.lobes.length; i++) {
      if (!c.lobes[i]) continue;
      if (
        nearest < 0 ||
        Math.abs(body.col + i - c.coreCol) < Math.abs(body.col + nearest - c.coreCol)
      )
        nearest = i;
    }
    if (nearest >= 0) curtainLobeOff(world, c, body, nearest);
  }
  curtainDrift(world, c, body);
  // **The jam.** The sheet the core just drifted under is the sheet the pair
  // cannot now shove: for `curtainPinBeats` the rail holds and the way back to
  // the core is the hem, lifted and held (`curtain-hand.ts`). A torn sheet has
  // no rail to jam, so a naked core is answered the way it always was.
  if (c.phase === "hung" && body !== undefined) {
    enterCurtain(world, c, "pinned");
    world.events.push({ type: "curtainPin", col: c.coreCol, beats: world.cfg.curtainPinBeats });
  }
}
