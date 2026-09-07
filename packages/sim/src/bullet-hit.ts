import { metColor, missedColor } from "./balance.js";
// The queen's petals and the warden's plates, next door: what a shot does when
// it meets a boss rather than an arrival (`bullet-hit-boss.ts`).
import { resolveQueen, resolveWarden } from "./bullet-hit-boss.js";
// And THE LURE, next door for the same reason: what a shot does when it meets
// the one body there is no right shot at (`bullet-hit-lure.ts`).
import { resolveLure } from "./bullet-hit-lure.js";
import { caromStruck } from "./carom.js";
import { choirIsDots, choirStruck } from "./choir.js";
import { chuteIsOpen, chuteStruck } from "./chute.js";
import { claspIsShielded, claspStruck } from "./clasp.js";
import { coilStruck } from "./coil.js";
import { coilIsDomed } from "./coil-state.js";
import { colourIsArmoured } from "./colour-armour.js";
import { linkStruck } from "./crawler-round.js";
import { echoStruck } from "./echo.js";
import { fenceStruck } from "./fence.js";
import { removeCreature } from "./field.js";
import { ghostStruck } from "./ghost.js";
import { lidStruck } from "./lid.js";
import { magnetStruck } from "./magnet.js";
import { recoilStruck } from "./recoil.js";
import { rindStruck } from "./rind.js";
import { shellIsBare } from "./shell.js";
import { shellStruck } from "./shell-round.js";
import { beadStruck } from "./strand-round.js";
import { throbStruck } from "./throb.js";
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
 * ever the beam THE LANCE burns a column with, and only through a body it
 * destroyed.
 *
 * A lance is not a licence: a rock still stops it, a wrong colour still stops
 * it, and the queen still takes exactly one petal. What it buys is the whole
 * *column* in its own colour, which is the one thing a column can hold that an
 * ordinary shot has to be fired at one body at a time. There is no count on it
 * any more — the owner took the three-body limit off on 7 September 2026 when
 * the beam became the weapon.
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
  if (hit.kind === "fence") {
    // **The cannon's half of THE FENCE.** Whether the wire comes apart here or
    // refuses, and what each costs, is one call: `fenceStruck` (`fence.ts`).
    fenceStruck(world, hit, b.col, b.color);
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
  // Three dots in a membrane, and the clasp's answer one creature on: nothing
  // a shot carries gets in until the pilot has made the gesture, so there is
  // no colour test here and no chipping branch (`choir.ts`).
  if (choirIsDots(hit)) {
    choirStruck(world, hit);
    return false;
  }
  // A dome over a rock, and the clasp's answer word for word (`coil.ts`).
  if (coilIsDomed(hit)) {
    coilStruck(world, hit);
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
  // One bead of a thread, and the one body in the game a shot can be wrong
  // about in two different ways at once: the wrong bead, or the right bead in
  // the wrong colour. Both answers are one rule, in `strand-round.ts` for
  // `claspStruck`'s reason (`strand.ts` for what the creature is).
  if (hit.kind === "strand") return beadStruck(world, b, hit);
  // One link of a worm walking the ship's surface. Three answers and two of
  // them are a rock's — an end and an armoured segment both take a crater and
  // nothing else, because neither is the cannon's to answer at all
  // (`crawler-round.ts`, and `crawler.ts` for what the creature is).
  if (hit.kind === "crawler") return linkStruck(world, b, hit);
  if (hit.kind === "lid") {
    // Plates that only part while a hand is on the cord, and the lens behind
    // them. All three answers a shot can get are one rule, in `lid.ts` for
    // `claspStruck`'s reason.
    lidStruck(world, b, hit);
    return false;
  }
  // A plate that turns away anything climbing straight, and two poles that
  // each take their own trigger. One rule, in `magnet.ts` for `claspStruck`'s
  // reason: the bearing that gets a bolt past the plate says which pole it met.
  if (hit.kind === "magnet") {
    magnetStruck(world, b, hit);
    return false;
  }
  if (hit.kind === "throb") {
    // Red down one side and cyan down the other, turning the whole way
    // down: which half the shot arrives at is which trigger answers it, and
    // it is one rule with the turn it is read off (`throb.ts`, for
    // `veilStruck`'s reason).
    throbStruck(world, b, hit);
    return false;
  }
  if (hit.kind === "wisp") {
    // Either colour, which nothing else on the field takes any more: the
    // ammunition was never the question a wisp asks. Getting a shot to the
    // tile at all is the whole of it, and the tile came out of somebody's
    // mouth (`wisp.ts`).
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
  // Still shut from the last wrong colour, and shut to *both* — which is the
  // whole of what makes a colour mistake cost something (`colour-armour.ts`).
  // Deliberately not a colour miss: the ammunition was right, the moment was
  // not — where a throb books the opposite way round, because the half a shot
  // arrived at is a question about the ammunition (`throb.ts`).
  if (colourIsArmoured(world, hit)) {
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return false;
  }
  if (hit.color !== b.color) {
    missedColor(world);
    // And the window opens here, on the one branch a wrong colour reaches.
    hit.colourStruckTick = world.tick;
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return false;
  }

  // Matching ammunition resonates the light organ until it bursts.
  metColor(world);
  world.score += world.cfg.scoreDestroy;
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: hit.color });
  removeCreature(world, hit.id);
  return b.lance;
}
