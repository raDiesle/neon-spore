import { metColor, missedColor } from "./balance.js";
import { removeCreature, removeCreatures } from "./field.js";
import type { Bullet, Creature } from "./types.js";
import { wardenColor, wardenCycle } from "./warden-cycle.js";
import { wardenEyeOpen } from "./warden-rope.js";
import type { World } from "./world.js";

/**
 * What a shot does when it meets a **boss**, as opposed to a body that arrived
 * on the queue.
 *
 * Split out of `bullet-hit.ts` when THE LID's branch took that file past its
 * 250-line limit, along a seam that was already the longest run in it. What
 * stays next door is the dispatch — *which* rule answers a shot — plus the two
 * or three lines each ordinary kind needs before handing off to its own file
 * (`veil.ts`, `echo.ts`, `rind.ts`, `lid.ts`, `clasp.ts`). These two are the
 * exception that never got a file of its own: a queen's petal and a warden's
 * plate are health rather than a state machine, so neither had anywhere else
 * to be — and both are long, because what they turn on is *which half of the
 * pair failed*, and every rejection here says so in a comment.
 *
 * Neither returns anything. A lance is not a licence: a boss takes exactly one
 * petal or one plate from one shot, so the shot is always spent
 * (`resolve` next door is what carries that decision for everything else).
 */

/**
 * The queen wears her petals as armour. A shot that matches her open colour,
 * in the one column of the two marks that is actually real this bloom,
 * takes one; anything else — the wrong colour, the wrong side, or a shot at
 * either mark while neither is open — skids off. The last petal brings her
 * down.
 *
 * `b.col`, not `hit.col`, is what the events below carry: `hit.col` is her
 * own centre column, where nothing stands, and a spark or a reject drawn
 * there instead of at the mark a player actually aimed at is drawn nowhere
 * a player was looking.
 */
export function resolveQueen(world: World, b: Bullet, hit: Creature): void {
  if (hit.color === null || hit.color !== b.color) {
    // A colour that could never have matched. Which of the two marks it went
    // up does not change that, so it is the colour balance's to carry.
    missedColor(world);
    world.events.push({ type: "reject", col: b.col, row: hit.row });
    return;
  }
  const weakSide = world.boss?.kind === "queen" ? world.boss.weakSide : 0;
  if (b.col !== hit.col + weakSide) {
    // Right colour, wrong mark — and deliberately *not* a colour miss. The
    // ammunition was correct; what failed was the side, which is the other
    // player's half of the call (`queen-mark.ts`). Charging it to the colour
    // balance would read the failure to the wrong player.
    world.events.push({ type: "reject", col: b.col, row: hit.row });
    return;
  }

  metColor(world);
  hit.petals -= 1;
  world.score += world.cfg.scoreQueenPetal;
  hit.color = null;
  if (world.boss?.kind === "queen") world.boss.closeBeat = world.beat;
  world.events.push({ type: "petal", col: b.col, row: hit.row, left: hit.petals });

  if (hit.petals <= 0) {
    removeCreature(world, hit.id);
    world.score += world.cfg.scoreQueenDown;
    world.boss = null;
    world.events.push({ type: "queenDown", col: b.col, row: hit.row });
  }
}

/**
 * THE WARDEN is armour everywhere except the hole, and the hole is only a
 * target for the two beats the rim's recoil holds it open. Three things have
 * to line up and each of them belongs to a different half of the pair's
 * attention: the eye has to be open, which is the rescue the *other* player
 * just made; the shot has to be in the pupil's column, which drifts; and it
 * has to carry the rim's colour, which follows the clamp and is therefore
 * known a whole cycle in advance.
 *
 * A second shot inside the same opening does nothing at all. A spray must not
 * be allowed to skip a plate — the fight is one aimed shot per rescue.
 */
export function resolveWarden(world: World, b: Bullet, hit: Creature): void {
  const boss = world.boss;
  if (boss === null || boss.kind !== "warden") return;
  if (!wardenEyeOpen(world, boss) || boss.eyeSpent || b.col !== boss.pupilCol) {
    // Armour, a shut iris, or an opening already spent. Deliberately *not* a
    // colour miss: the ammunition may have been perfectly right and the moment
    // wrong, and charging that to the colour balance would read the failure to
    // the wrong player.
    world.events.push({ type: "reject", col: b.col, row: hit.row });
    return;
  }
  const rim = wardenColor(wardenCycle(world.cfg, world.waveBeat));
  if (b.color !== rim) {
    // The rim has carried this colour since the tether attached, on both
    // screens. Getting it wrong is a colour miss and nothing else.
    missedColor(world);
    world.events.push({ type: "reject", col: b.col, row: hit.row });
    return;
  }

  metColor(world);
  boss.eyeSpent = true;
  boss.plates -= 1;
  world.score += world.cfg.scoreWardenPlate;
  world.events.push({ type: "plate", col: b.col, row: hit.row, left: boss.plates, color: rim });

  if (boss.plates <= 0) {
    removeCreatures(world, [hit.id, boss.tetherId]);
    world.score += world.cfg.scoreWardenDown;
    world.boss = null;
    world.events.push({ type: "wardenDown", col: b.col, row: hit.row });
  }
}
