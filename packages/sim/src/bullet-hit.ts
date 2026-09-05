import { metColor, missedColor } from "./balance.js";
// The queen's petals and the warden's plates, next door: what a shot does when
// it meets a boss rather than an arrival (`bullet-hit-boss.ts`).
import { resolveQueen, resolveWarden } from "./bullet-hit-boss.js";
import { caromStruck } from "./carom.js";
import { chuteIsOpen, chuteStruck } from "./chute.js";
import { claspIsShielded, claspStruck } from "./clasp.js";
import { echoStruck } from "./echo.js";
import { removeCreature } from "./field.js";
import { ghostStruck } from "./ghost.js";
import { costHull } from "./hull.js";
import { lidStruck } from "./lid.js";
import { recoilStruck } from "./recoil.js";
import { rindStruck } from "./rind.js";
import { shellIsBare } from "./shell.js";
import { shellStruck } from "./shell-round.js";
import { type Bullet, type Creature, isWardable } from "./types.js";
import { veilStruck } from "./veil.js";
import { wispStruck } from "./wisp.js";
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
  if (isWardable(hit.kind)) {
    // A rock cannot be broken, because it does not live. The shot leaves a
    // crater and nothing else — the rule made visible (docs/spec/graphics.md).
    //
    // `isWardable` rather than `isMeteorKind`, so THE VOLLEY's shell is here
    // too: while it is on, the cannon has nothing to say to that body and the
    // colour burning through the seams is a sentence for later. The instant
    // the shell bursts the kind is a slick's or a bulb's and this branch stops
    // catching it (`volley.ts`).
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
  if (claspIsShielded(hit)) {
    claspStruck(world, hit);
    return false;
  }
  if (hit.kind === "veil") {
    // The cloud, the body inside it and the armour a wrong colour buys — all
    // one rule, and it lives in `veil.ts` for `claspStruck`'s reason.
    return veilStruck(world, b, hit);
  }
  if (hit.kind === "ghost") {
    // A kill that has to be *seen* by the seat that never saw the body, so it
    // carries a picture of its own — `ghost.ts`, for `veilStruck`'s reason.
    return ghostStruck(world, b, hit);
  }
  if (hit.kind === "echo") {
    // The matching colour, like a slick — and paid for every body this one
    // would still have become, which is the whole of why a shot fired early is
    // worth four fired late (`echo.ts`).
    return echoStruck(world, b, hit);
  }
  // The matching colour, like a slick — but the first shots land on a layer
  // rather than on the body, which is the whole creature (`rind.ts`).
  if (hit.kind === "rind") return rindStruck(world, b, hit);
  // The matching colour, like a slick — and it throws the body two rows back
  // up the field, a lane to one side, in the other colour. Everything the pair
  // had agreed about this arrival expires on the beat their own shot landed,
  // which is the whole creature (`recoil.ts`).
  if (hit.kind === "recoil") return recoilStruck(world, b, hit);
  // The matching colour, like a slick — and what is left standing is not a
  // corpse, it is a rock. The shot is only the first half of this creature and
  // the shield has to take the second, which is why it is the one kill in the
  // game that hands a body to the other player (`carom.ts`).
  if (hit.kind === "carom") return caromStruck(world, b, hit);
  // The body that carom threw out, shot while it is hanging under its canopy.
  // The same price a slick pays — the branch buys a picture, not a rule
  // (`chute.ts`) — and only while the canopy is out: one still climbing under
  // its own thrust has nothing to cut and falls through to the ordinary kill
  // below, which is the branch a slick takes.
  if (hit.kind === "chute" && chuteIsOpen(hit)) return chuteStruck(world, b, hit);
  if (hit.kind === "lid") {
    // Plates that only part while a hand is on the cord, and the lens behind
    // them. All three answers a shot can get are one rule, in `lid.ts` for
    // `claspStruck`'s reason.
    lidStruck(world, b, hit);
    return false;
  }
  if (hit.kind === "throb") {
    resolveThrob(world, b, hit);
    return false;
  }
  if (hit.kind === "wisp") {
    // Either colour, like an open throb: the ammunition was never the
    // question a wisp asks. Getting a shot to the tile at all is the whole of
    // it, and the tile came out of somebody's mouth (`wisp.ts`).
    wispStruck(world, b, hit);
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
  removeCreature(world, hit.id);
  b.pierced += 1;
  return b.lance && b.pierced < world.cfg.lancePierce;
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
  removeCreature(world, hit.id);
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
  removeCreature(world, hit.id);
}
