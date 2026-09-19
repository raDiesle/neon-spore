import { curtainBoss, curtainLobesLeft, curtainReach, curtainStride } from "./curtain.js";
import { enterCurtain } from "./curtain-step.js";
import { removeCreatures } from "./field.js";
import { bodyCenterCol } from "./span.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **The shove**: two hands on the sheet, carrying it along its rail — and the
 * two things that happen instead when the sheet will not go.
 *
 * Cut off `curtain-step.ts` at the 250-line limit the tick the jam went in,
 * along the seam that file's header had already drawn twice: next door is the
 * **clock**, what the beat counts down, and here is what the **pair's hands**
 * do to the cloth sideways. The hem lifted *up* is the fight's other hand and
 * is `curtain-hand.ts`; the roll-back stayed with the count that calls it.
 *
 * On the **beat**, from `grip-push.ts`, after the carry has reconciled two
 * thumbs. A column is the unit the pair says out loud, so a column is the
 * unit the sheet moves by.
 */

/**
 * **The carry, at boss scale.** Both hands are already reconciled by the
 * time this is called — `carryDir` has cancelled two thumbs going opposite
 * ways and `spend` has charged the ones that won — so what is left is one
 * direction and a stride. A bare hem cannot hold its rail and the shove
 * tears the sheet off instead of moving it — unless the rail is jammed, and
 * then nothing here happens at all.
 */
export function curtainShoved(
  world: World,
  body: Creature,
  dir: -1 | 1,
  paid: readonly (1 | 2)[],
): void {
  const c = curtainBoss(world);
  if (c === null || c.creatureId !== body.id) return;
  for (const player of paid) {
    world.events.push({
      type: "carry",
      player,
      col: bodyCenterCol(body, body.col),
      row: body.row,
      dir,
    });
  }
  if (c.phase !== "hung") {
    // **The jam.** A rail a hit has pinned does not slide, and the shove is
    // refused whole — the tear below included, so a bare hem cannot be torn
    // off inside the beats the hit bought. The hem is what gives instead
    // (`curtain-hand.ts`).
    world.events.push({ type: "curtainJam", col: body.col, dir });
    return;
  }
  if (curtainLobesLeft(c) === 0) {
    removeCreatures(world, [body.id]);
    c.soft = [];
    enterCurtain(world, c, "torn");
    c.fireBeat = world.beat;
    world.events.push({ type: "curtainTear", col: c.coreCol });
    return;
  }
  const stride = curtainStride(c, world.cfg);
  const reach = curtainReach(world.cfg);
  const to = Math.max(reach.min, Math.min(reach.max, body.col + dir * stride));
  if (to === body.col) return;
  body.fromCol = body.col;
  body.col = to;
  c.moveBeat = world.beat;
  world.events.push({ type: "curtainShove", col: to, dir, stride });
}
