import { metColor, missedColor } from "./balance.js";
// **The bodies a bolt never kills** — a rock, a mine, a wall, the two bosses,
// a soundbox, a lure, a clasp, three dots, a balloon, a dome and a moult
// wearing its cargo. Twelve branches that all stood at the top of this file
// and all ended the bolt, cut out next door when THE MOULT took it over its
// limit (`bullet-hit-shut.ts`). The queen, the warden and the lure went with
// them: each had already been carried out to a file of its own and was only
// ever reached from inside that block.
import { struckWithoutKilling } from "./bullet-hit-shut.js";
import { caromStruck } from "./carom.js";
import { chuteIsOpen, chuteStruck } from "./chute.js";
import { colourIsArmoured } from "./colour-armour.js";
import { countdownStruck } from "./countdown.js";
import { linkStruck } from "./crawler-round.js";
import { wornKind } from "./creature-rules.js";
import { crystalStruck } from "./crystal.js";
import { echoStruck } from "./echo.js";
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
import type { Bullet, Creature } from "./types.js";
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
  // **Every body a bolt never kills** — a rock, a mine, a wall, the two
  // bosses, a soundbox, a lure, a clasp, three dots, a balloon, a dome, and a
  // moult wearing its cargo. Twelve branches and one seam: each ends the bolt
  // and none can take a body off the field, so they are one call
  // (`bullet-hit-shut.ts`), cut out when THE MOULT took this file over its
  // limit. What is left below is the other half — the bodies a shot can
  // answer, where the question is which colour and what the kill is worth.
  if (struckWithoutKilling(world, b, hit)) return false;
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
  // Two bodies in one shell, and the only tile a shot can open is the middle
  // — in its own colour, while the ship's shield stands armed in that lane.
  // Everything else bounces off and costs a row. One rule, in `crystal.ts`
  // for `claspStruck`'s reason.
  if (hit.kind === "crystal") return crystalStruck(world, b, hit);
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
  if (hit.kind === "countdown") {
    // Open one beat in five, and only the pilot can see which. Off zero the
    // hull pays and the body stays; on zero in its colour it is a kill; on
    // zero otherwise it is an ordinary body and the tail below books the
    // colour miss (`countdown.ts`).
    const struck = countdownStruck(world, b, hit);
    if (struck === "killed") return b.lance;
    if (struck === "shut") return false;
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
  world.events.push({
    type: "destroy",
    col: hit.col,
    row: hit.row,
    color: hit.color,
    kind: wornKind(hit),
  });
  removeCreature(world, hit.id);
  return b.lance;
}
