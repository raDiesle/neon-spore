import { beadIsActive, beadIsSpent, type Creature, type World } from "@neon-spore/sim";
import { hazed } from "./depth.js";
import type { Layout } from "./layout.js";
import { applyLivingFrame, livingFrame } from "./living-frame.js";
import { PLATE, PLATE_RIM } from "./shell-plate.js";
import { showsBeadColor, showsBeadMark } from "./strand.js";
import { reelFrame } from "./strand-bead.js";
import { hoppedEnd } from "./strand-mark.js";
import { edgePath, platesPath } from "./strand-plate.js";
import { strandThreads } from "./strand-thread.js";

/**
 * THE STRAND's armour: the plating around every bead a shot **cannot** answer
 * this instant.
 *
 * **The defect it repairs.** A thread of five live bodies is five bodies that
 * look shootable, and only one of them is. The pilot's screen showed the
 * colours and a soft light on the two candidate ends, and the three in the
 * middle sat there looking exactly like three ordinary arrivals — which is a
 * picture that invites the one shot this creature punishes. A mark saying
 * *this one* was never going to be enough on its own; what the field needed
 * was a mark saying *not these*.
 *
 * **It is a second border around the body's own, and that is the owner's
 * instruction.** The first two versions of this were a circle around the bead
 * — six arcs on a ring, then six plates on a band — and a ring around a slick
 * is a ring around a *tile*, not armour on an animal: it sat at the same
 * radius whether the body under it was a wide flat slick or a round bulb, and
 * it read as a helper drawn on the field rather than as something the creature
 * is wearing. So the plating is cut from the **body's own contour**, the way
 * THE SHELL's is (`shell-plate.ts`): the slick keeps its outline and gains a
 * second, harder one a little outside it, and the bulb gains its own. Two
 * borders on one shape, the second one plainly not alive.
 *
 * It is drawn **after** the bodies rather than before them, for the same
 * reason THE SHELL's plating is: an outline laid over the body's own is a
 * statement about the body, and one drawn underneath comes back out through
 * the glow passes as a smudge.
 *
 * **Grey, and grey is a word the pair already has.** `PLATE` and `PLATE_RIM`
 * are THE SHELL's own two greys, borrowed rather than re-picked: hard armour
 * in this game is already that dark face with that bright rock edge, and a
 * pair who have met a shell read this as armour before they have read it as
 * anything else.
 *
 * **What is locked is not the same on the two screens, and that is the whole
 * split drawn instead of said.** On the navigator's, exactly one bead is bare
 * and it is the lit one. On the pilot's, exactly one bead is bare too — but it
 * is whichever end the frame is hopping over this instant (`hoppedEnd`), so the
 * two ends flick between caged and open several times a second and the inner
 * beads never open at all. The pilot is shown *one of these two, and I cannot
 * tell you which*; the navigator is shown which. Neither picture contains the
 * other's half.
 *
 * **Indestructible for now**, which is the owner's phrase and an accurate one:
 * nothing takes a plate off. The cage is a statement about *this instant* and
 * it moves the moment the run changes, because which bead may be shot is
 * rolled again after every shot (`lightStrandEnd`).
 */

/** How heavily a plate is outlined and how brightly its outer edge is lit,
 * both as shares of the body's own drawn radius — a rim thinner than a line is
 * a line, so a pixel floor sits under each. */
const RIM_WIDTH = 0.05;
const EDGE_WIDTH = 0.09;
const EDGE_ALPHA = 0.6;

/**
 * The beads this screen must show as unanswerable: every live one that a shot
 * fired now would be refused.
 *
 * The pilot's list is deliberately **not** the truth, and it is not a lie
 * either. Four of a run of five really are locked, and which four is the
 * navigator's half — so what the pilot is shown instead is the hop: every bead
 * but one is caged, the uncaged one is always one of the two ends, and which
 * end changes several times a second. Nothing on that screen is wrong for
 * longer than a quarter of a second, and nothing on it can be read.
 */
export function lockedBeads(
  showsMark: boolean,
  world: World,
  on: Creature[],
  guess: Creature | null,
): Creature[] {
  const live = on.filter((c) => !beadIsSpent(c));
  if (showsMark) return live.filter((c) => !beadIsActive(world, c));
  return live.filter((c) => c.id !== guess?.id);
}

/**
 * Every caged bead on the field, plated.
 *
 * Called from `frame-field.ts` after `drawCreatures`, beside THE SHELL's own
 * plating pass and for its reasons. Which beads are caged is worked out here
 * rather than handed over from the thread pass, and the hop it depends on is
 * `hoppedEnd` — one exported function of the wall clock, called twice with the
 * same `time` — so the bead this leaves open and the bead the pilot's frame is
 * over are the same bead by construction rather than by agreement.
 */
export function drawStrandArmour(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  const showsMark = showsBeadMark(l);
  for (const on of strandThreads(world)) {
    const guess = showsMark
      ? null
      : hoppedEnd(
          on.filter((c) => !beadIsSpent(c)),
          time,
        );
    for (const c of lockedBeads(showsMark, world, on, guess)) {
      drawBeadArmour(ctx, l, world, c, beatPhase, time);
    }
  }
}

/**
 * The cage on one bead: six curved plates cut from the body's own contour and
 * standing just outside it.
 *
 * The two screens draw two different bodies under this — the pilot's real
 * slick or bulb, the navigator's reel rolling between the pair of them — so
 * the plating is cut to whichever of those this screen has, and on the
 * navigator's it flattens and jumps with the reel. Same armour, same grey,
 * fitted to what is actually there: a cage that ignored the reel would be the
 * one thing on that screen holding still, which is a tell about a body that is
 * supposed to be unreadable.
 */
export function drawBeadArmour(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  beatPhase: number,
  time: number,
): void {
  const beats = world.beat + beatPhase;
  const reel = showsBeadColor(l) ? null : reelFrame(l, c, beatPhase, time);
  const f = reel ?? livingFrame(l, c, beatPhase, time);
  ctx.save();
  if (reel) {
    ctx.translate(reel.x, reel.y);
    ctx.scale(reel.scale * reel.squash.sx, reel.scale * reel.squash.sy);
  } else {
    applyLivingFrame(ctx, l, world.cfg, c, f, beats, beatPhase);
  }
  const lw = (h: number): number => Math.max(1, f.r * h) / f.scale;
  const plates = platesPath(f.shape, f.t);
  ctx.fillStyle = hazed(world.cfg, PLATE, f.near);
  ctx.fill(plates);
  const rim = hazed(world.cfg, PLATE_RIM, f.near);
  ctx.strokeStyle = rim;
  ctx.lineWidth = lw(RIM_WIDTH);
  ctx.stroke(plates);
  // And the light along the outer edge only, which is where it would catch on
  // a hard thing. Its own pass rather than a heavier rim, so the plating reads
  // as facing the sky rather than as being outlined twice.
  ctx.globalAlpha = EDGE_ALPHA;
  ctx.lineWidth = lw(EDGE_WIDTH);
  ctx.stroke(edgePath(f.shape, f.t));
  ctx.globalAlpha = 1;
  ctx.restore();
}
