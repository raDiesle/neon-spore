import { markMoment } from "./balance.js";
import { costHull } from "./hull.js";
import { shellIsBare } from "./shell.js";
import { shellStruck } from "./shell-round.js";
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
  if (hit.kind === "lure") {
    resolveLure(world, b, hit);
    return false;
  }
  if (hit.kind === "throb") {
    resolveThrob(world, b, hit);
    return false;
  }
  if (hit.kind === "shell" && !shellIsBare(hit)) {
    // Armour, and armour has no colour: either shot chips it, so while the
    // shell is on this arrival is answered by the column alone. The moment the
    // last piece goes the body acquires a colour and falls through to the
    // branch below on the *next* shot — deliberately the same branch a slick
    // is killed by, so "then it needs the matching shot like any other body"
    // is one code path and not a second copy of one.
    shellStruck(world, b, hit);
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
 * THE LURE: a full-size slick or bulb in every pixel player 1 owns, and
 * nothing about the shot matters except that it landed. Landing it is the
 * mistake. It turns the reflex that pays off against every other aim target
 * (match the colour, pull the trigger) into a decision the pair has to make on
 * purpose — and only one of them can see which body to make it about, so the
 * decision has to be spoken.
 *
 * The colour is deliberately not consulted. A lure wears one and a shot in it
 * would otherwise be a kill; testing it here would make a *wrong* colour the
 * cheaper mistake, and there is no such thing as a right shot at this body.
 *
 * **Reaching the hull is special-cased, and that is the reversal.** It used to
 * be the opposite here, for the Runt: the hull was left to the generic branch
 * because the only thing that kind changed was what a shot did to it. A lure
 * changes the other half too. It goes on its own, `lureVanishRows` up
 * (`lureIsSpent`, creature-rules.ts), so the hull branch never sees one — and
 * that is the whole vindication. Player 1 was told to leave a column and did
 * not want to; what they get back is the body disappearing by itself, which
 * nothing else in this game does.
 *
 * So the only way this creature can cost the pair anything is a shot, and the
 * hull is what it costs. Not the score: two currencies for one mistake reads
 * as bookkeeping, and the hull is the one the pair actually feels.
 */
function resolveLure(world: World, _b: Bullet, hit: Creature): void {
  costHull(world, world.cfg.damageLure);
  world.events.push({ type: "lureHit", col: hit.col, row: hit.row });
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
 *
 * Exported for THE VANE, which is the one boss a shot never *meets*: its
 * bearing hangs above the field, so the shot that answers it is resolved where
 * a bullet runs out of field rather than here (`vane.ts`). It still books the
 * same two moments, and it books them by calling these rather than by writing
 * `colorHits += 1` a second time somewhere else.
 */
export function metColor(world: World): void {
  world.balance.colorHits += 1;
  markMoment(world, true);
}

/** The same moment, missed: the wrong colour went up the column. */
export function missedColor(world: World): void {
  world.balance.colorMisses += 1;
  markMoment(world, false);
}
