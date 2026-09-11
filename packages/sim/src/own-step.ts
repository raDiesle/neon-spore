import { stepCarom } from "./carom.js";
import { stepChute } from "./chute.js";
import { stepCoil } from "./coil.js";
import { stepCrystal } from "./crystal.js";
import { stepDart } from "./dart.js";
import { ghostCrosses, stepGhostAcross } from "./ghost.js";
import { stepGyre } from "./gyre.js";
import { rockCrosses, stepRockAcross } from "./rock-cross.js";
import { slowStep } from "./slow-fall.js";
import type { Creature } from "./types.js";
import { stepVolley, volleyIsClimbing } from "./volley.js";
import { stepWisp } from "./wisp.js";
import type { World } from "./world.js";

/**
 * **The bodies that move by a rule of their own instead of falling**, and the
 * one question `onBeat` asks before it drops anything.
 *
 * Cut out of `beat.ts` when THE COIL's branch took that file past its 250-line
 * limit, and along the seam that file's own comments have been drawing for
 * nine creatures: every one of them says *in place of the line below rather
 * than beside it*, and gives the same reason in that creature's own terms — a
 * body that both stepped and fell would cover twice the ground it is drawn
 * covering. That sentence is a rule, it is written out nine times, and this is
 * the rule.
 *
 * What is left next door is the shape of a beat: the metronome, the arrivals,
 * the boss, the pods, the hull, the wave clearing — and, inside the loop, the
 * fall itself and the two things that happen *beside* one (THE VEIL turning
 * over, THE VEER taking its lane). Those two are deliberately not here: they
 * are the exceptions to this file's own rule, and a reader has to meet them
 * where the fall they accompany is.
 *
 * **Order is the contract, and it is the order the branches were written in.**
 * `volleyIsClimbing` and `ghostCrosses` are conditions on a body rather than
 * on a kind, so a rearrangement could quietly change which of two rules a body
 * reaches — a volley is a rock the rest of the time and would fall through to
 * nothing here, which is exactly right, and only because the climb is asked
 * about first.
 */

/**
 * Whether this body has already moved. `true` means the caller must not fall
 * it — the rule that answered has done the whole of this beat for it, drop
 * included where there is one.
 *
 * Called only for a body that is still above the ship's row and is not a boss,
 * a mount, a link of a worm or a balloon: `beat.ts` has answered all five
 * before it asks, the last because it keeps its `from` fields across beats.
 */
export function steppedInsteadOfFalling(world: World, c: Creature): boolean {
  // A dart takes a diagonal every other beat and hangs in between, and
  // `stepDart` is the whole of that — a body that both stepped and fell would
  // be moving three rows on the beats it moved.
  if (c.kind === "dart") {
    stepDart(world, c);
    return true;
  }
  // A carom crosses the field on a diagonal and turns at the walls; the drop
  // is inside `stepCarom`. More rides on this one than on any of them: a body
  // that both caromed and fell would be dropping twice the rows it is drawn
  // dropping, and the wall count `caromCols` was chosen for would be wrong by
  // half.
  if (c.kind === "carom") {
    stepCarom(world, c);
    return true;
  }
  // THE CRYSTAL crosses on the carom's diagonal, with the drop inside
  // `stepCrystal`, and for the carom's reason. The two halves it breaks into
  // are a plain slick and a plain bulb by then and fall through here like
  // any other.
  if (c.kind === "crystal") {
    stepCrystal(world, c);
    return true;
  }
  // THE COIL crosses the field to the left and sinks two rows at each wall it
  // turns at — and on the beat the charge reaches it, the dome comes off
  // instead of any of that (`stepCoil`). The branch inside it matters as much
  // as this one: a body that both opened and crossed would be freed two lanes
  // from where the pair watched it happen.
  if (c.kind === "coil") {
    stepCoil(world, c);
    return true;
  }
  // The body thrown out of a carom does not fall until it has finished going
  // up. `stepChute` is the climb, the canopy opening at the top and the
  // half-speed descent after it — and here it is the *sign* that matters: a
  // body that both climbed and fell would go nowhere at all.
  if (c.kind === "chute") {
    stepChute(world, c);
    return true;
  }
  // A volley a ward has just hit back **climbs**, and only then: it is a rock
  // the rest of the time and falls through this file like one, which is the
  // whole of that creature. The sharpest version of the rule in the game — a
  // body that both climbed and fell would end a ward exactly where it started
  // one.
  if (volleyIsClimbing(c)) {
    stepVolley(world, c);
    return true;
  }
  // A wisp does not cross the ground between two tiles: on the beats
  // `wispHops` names it is simply somewhere else, and on the beats between it
  // is nowhere new. A body that both hopped and fell would be arriving one row
  // lower than the tile player 2 just read out.
  if (c.kind === "wisp") {
    stepWisp(world, c);
    return true;
  }
  // A crossing ghost drifts in to the row it prowls along, walks it a column a
  // beat, and only comes down once its temper is spent (`stepGhostAcross`). A
  // body that both walked and fell would be moving in two directions at once.
  if (ghostCrosses(c)) {
    stepGhostAcross(world, c);
    return true;
  }
  // A rock the wave authored onto a crossing walks a row, turns at the walls
  // and sinks only there (`stepRockAcross`) — the fall in is inside it too. A
  // condition on a body rather than on a kind, like the two above it: any
  // plain rock may be given the path, and one that both walked and fell would
  // be sinking a row a beat down a field it is drawn crossing.
  if (rockCrosses(c)) {
    stepRockAcross(world, c);
    return true;
  }
  // The two bodies that come down slower than a tile a beat, and what each
  // does with the beats it does not spend falling: THE ECHO nothing at all,
  // THE STRAND its wave. An echo still *falls* on the beats it takes, so a
  // hand may be put on one and slows it further through the same
  // `grippedFallTiles` every other body uses (`slow-fall.ts`).
  if (slowStep(world, c)) return true;
  // THE GYRE's hub walks a diamond, turns its rim and carries its six bodies
  // with it — a wheel that both walked and fell would be moving in two
  // directions on one beat.
  if (c.kind === "gyre") {
    stepGyre(world, c);
    return true;
  }
  return false;
}
