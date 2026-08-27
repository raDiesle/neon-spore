import { markMoment } from "./balance.js";
import { type Bullet, type Creature, isMeteorKind } from "./types.js";
import { wardenEyeOpen } from "./warden.js";
import { wardenColor, wardenCycle } from "./warden-cycle.js";
import type { World } from "./world.js";

/**
 * What a shot does when it meets something. Split out of `bullets.ts` when THE
 * LANCE arrived and the file went over: travelling and arriving are two
 * separate questions, and the second one now has an answer — whether the shot
 * survives the body it met — that the first one has to act on.
 */

/**
 * Spend the bullet on the creature it met. True when the shot goes on — only
 * ever a lance, and only through a body it destroyed, and only while it has
 * `lancePierce` bodies left in it.
 *
 * A lance is not a licence: a rock still stops it, a wrong colour still stops
 * it, and the queen still takes exactly one petal. What it buys is a *line* of
 * its own colour, which is the only thing the column can hold that an ordinary
 * shot has to be fired at one body at a time.
 */
export function resolve(world: World, b: Bullet, hit: Creature): boolean {
  if (isMeteorKind(hit.kind)) {
    // A rock cannot be broken, because it does not live. The shot leaves a
    // crater and nothing else — the rule made visible (docs/spec/graphics.md).
    hit.holes = Math.min(world.cfg.maxHoles, hit.holes + 1);
    world.events.push({ type: "hole", col: hit.col, row: hit.row });
    return false;
  }
  if (hit.kind === "queen") {
    resolveQueen(world, b, hit);
    return false;
  }
  if (hit.kind === "warden") {
    resolveWarden(world, b, hit);
    return false;
  }
  if (hit.kind === "runt") {
    resolveRunt(world, b, hit);
    return false;
  }
  if (hit.kind === "throb") {
    resolveThrob(world, b, hit);
    return false;
  }
  if (hit.color !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return false;
  }

  // Matching ammunition resonates the light organ until it bursts.
  metColor(world);
  world.score += world.cfg.scoreDestroy;
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: hit.color });
  world.creatures = world.creatures.filter((c: Creature) => c.id !== hit.id);
  b.pierced += 1;
  return b.lance && b.pierced < world.cfg.lancePierce;
}

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
function resolveQueen(world: World, b: Bullet, hit: Creature): void {
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
    world.creatures = world.creatures.filter((c: Creature) => c.id !== hit.id);
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
function resolveWarden(world: World, b: Bullet, hit: Creature): void {
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
    const gone = new Set([hit.id, boss.tetherId]);
    world.creatures = world.creatures.filter((c: Creature) => !gone.has(c.id));
    world.score += world.cfg.scoreWardenDown;
    world.boss = null;
    world.events.push({ type: "wardenDown", col: b.col, row: hit.row });
  }
}

/**
 * The Runt: tiny, helpless, and carries no colour — nothing about the shot
 * matters except that it landed. Landing it is the mistake. It turns the
 * reflex that pays off against every other aim target (match the colour,
 * pull the trigger) into a decision the pair has to make on purpose: this one
 * is not a target, whatever it looks like at a glance.
 *
 * Reaching the hull is deliberately *not* special-cased — it costs the hull
 * exactly what any other missed creature does (`hull.ts`'s generic branch),
 * because the only thing this kind changes is what happens if it is shot.
 */
function resolveRunt(world: World, b: Bullet, hit: Creature): void {
  world.score = Math.max(0, world.score - world.cfg.scoreRuntPenalty);
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: b.color });
  world.creatures = world.creatures.filter((c: Creature) => c.id !== hit.id);
}

/**
 * The Throb: swells and shrinks on the shared beat (`throbIsOpen`,
 * creature-rules.ts) rather than carrying a colour. A shot while it is shut
 * is a shot at the wrong *moment* rather than the wrong body — the timing
 * equivalent of a colour miss, and deliberately not scored as one, since the
 * ammunition was never the question. Either colour lands it while it is open.
 */
function resolveThrob(world: World, b: Bullet, hit: Creature): void {
  if (!hit.throbOpen) {
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return;
  }
  world.score += world.cfg.scoreThrobHit;
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: b.color });
  world.creatures = world.creatures.filter((c: Creature) => c.id !== hit.id);
}

/**
 * A shot met a creature in its own colour. A joint moment: player 2 is the
 * only one who can see the colour and player 1 is the only one who can load
 * it, so the shot is the pair agreeing out loud (docs/spec/couplings.md).
 *
 * A rock is not counted either way — it has no colour to get right.
 */
function metColor(world: World): void {
  world.balance.colorHits += 1;
  markMoment(world, true);
}

/** The same moment, missed: the wrong colour went up the column. */
function missedColor(world: World): void {
  world.balance.colorMisses += 1;
  markMoment(world, false);
}
