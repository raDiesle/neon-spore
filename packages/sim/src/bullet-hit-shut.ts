import { balloonStruck } from "./balloon.js";
import { beatboxStruck } from "./beatbox-round.js";
import { resolveQueen, resolveWarden } from "./bullet-hit-boss.js";
import { resolveLure } from "./bullet-hit-lure.js";
import { refuseBolt, refusesABolt } from "./bullet-refused.js";
import { choirIsDots, choirStruck } from "./choir.js";
import { claspIsShielded, claspStruck } from "./clasp.js";
import { coilStruck } from "./coil.js";
import { coilIsDomed } from "./coil-state.js";
import { fenceStruck } from "./fence.js";
import { moultStruck } from "./moult.js";
import { spanOf } from "./span.js";
import { type Bullet, type Creature, isWardable } from "./types.js";
import type { World } from "./world.js";

/**
 * **The bodies a bolt never kills**, and what each of them does with one
 * instead.
 *
 * Split out of `bullet-hit.ts` when THE MOULT's branch took that file over its
 * 250-line limit, and along a seam that file had already sorted itself into:
 * every branch here stood ahead of every other one there, every one of them
 * ends the bolt, and not one of them can ever take a body off the field. What
 * is left next door is the other half — the bodies a shot *can* answer, where
 * the question is which colour and what the kill is worth.
 *
 * The list is longer than it looks like it ought to be, and that is the game
 * rather than an accident of dispatch. A pair learns the cannon first and then
 * spends the rest of the bestiary learning the places it is the wrong tool: a
 * rock, a mine, a wall, two bosses, a soundbox, a lure, a clasp, three dots, a
 * balloon, a dome, and a moult wearing its cargo. Reading them in one file is
 * reading that lesson in one place.
 *
 * Returns **true when the bolt was spent here**, which is every branch it
 * takes; the caller goes on to the killable bodies only when this answers
 * false. It is that question rather than the "does the shot go on" one next
 * door, because nothing in this file ever lets a bolt through — a lance burns
 * a column *through a body it destroyed*, and there is nothing here it can
 * destroy.
 */
export function struckWithoutKilling(world: World, b: Bullet, hit: Creature): boolean {
  // **THE MOULT**, ahead of the rock branch because half the time it is one: a
  // crater while it is wearing its shell and a spent bolt while it is wearing
  // its cargo, which is one question asked of the beat (`moult.ts`).
  // `isWardable` is deliberately false for the kind — a list that said
  // otherwise would hand the shield's row to the half it cannot answer.
  if (hit.kind === "moult") {
    moultStruck(world, hit);
    return true;
  }
  if (isWardable(hit.kind)) {
    // A rock cannot be broken, because it does not live. The shot leaves a
    // crater and nothing else — the rule made visible (docs/spec/graphics.md).
    // `isWardable` rather than `isMeteorKind`, so THE VOLLEY's shell is here
    // too: while it is on, the cannon has nothing to say to that body, and the
    // instant it bursts the kind is a slick's and this branch stops catching
    // it (`volley.ts`).
    hit.holes = Math.min(world.cfg.maxHoles, hit.holes + 1);
    world.events.push({
      type: "hole",
      col: hit.col,
      row: hit.row,
      kind: hit.kind,
      span: spanOf(hit),
    });
    return true;
  }
  // A body the cannon cannot answer still stops the bolt (`bullet-refused.ts`).
  if (refusesABolt(hit.kind)) {
    refuseBolt(world, b, hit);
    return true;
  }
  if (hit.kind === "fence") {
    // **The cannon's half of THE FENCE.** Whether the wire comes apart here or
    // refuses, and what each costs, is one call: `fenceStruck` (`fence.ts`).
    fenceStruck(world, hit, b.col, b.color);
    return true;
  }
  if (hit.kind === "queen") {
    resolveQueen(world, b, hit);
    return true;
  }
  if (hit.kind === "warden") {
    resolveWarden(world, b, hit);
    return true;
  }
  if (hit.kind === "beatbox") {
    // **A soundbox refuses every shot**, and it is the creature rather than an
    // omission: it carries no colour, so no ammunition could be right, and what
    // answers one is a thumb on the beat (`beatbox-round.ts`).
    beatboxStruck(world, b, hit);
    return true;
  }
  if (hit.kind === "lure") {
    resolveLure(world, b, hit);
    return true;
  }
  if (claspIsShielded(hit)) {
    claspStruck(world, hit);
    return true;
  }
  // Three dots in a membrane, and the clasp's answer one creature on: nothing a
  // shot carries gets in until the pilot has made the gesture (`choir.ts`).
  if (choirIsDots(hit)) {
    choirStruck(world, hit);
    return true;
  }
  // A balloon, and there is nothing a bolt can do to one. Not a colour miss:
  // it carries no colour at all, so there was no right ammunition to have
  // loaded, and what the pair has misread is what the body is rather than what
  // it is made of (`balloon.ts`). Two hands are its whole answer.
  if (hit.kind === "balloon") {
    balloonStruck(world, hit);
    return true;
  }
  // A dome over a rock, and the clasp's answer word for word (`coil.ts`).
  if (coilIsDomed(hit)) {
    coilStruck(world, hit);
    return true;
  }
  return false;
}
