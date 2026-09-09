import type { Variant } from "../variant.js";
import { BREAK_SHATTER } from "./creature-break/shatter/index.js";
// region: candidates
import { METEOR_FORGE } from "./creature-meteor/forge/index.js";
import { SKIN_VEIL } from "./creature-skin/veil/index.js";
import { EYE_TURN } from "./eye-iris/turn/index.js";
import { JOIN_BOTH } from "./panel-join/both/index.js";
import { JOIN_ORGANS } from "./panel-join/organs/index.js";
import { JOIN_ROOF } from "./panel-join/roof/index.js";
import { SHELL_SLAB } from "./shell-plate/slab/index.js";
import { CRATER_SPALL } from "./ship-crater/spall/index.js";
// endregion

/**
 * Every candidate currently offered, in the order the pair should show them.
 *
 * Assembled the way `tools/shape-sheet/src/drafts/index.ts` assembles DRAFTS —
 * one import per candidate, one array — for the same reason: adding an answer
 * is one directory and one line, and removing a decided slot is a `git rm -r`
 * and the same line back out again.
 *
 * The left-hand side of the pair is not in here. It is whatever the game draws
 * today, read off the live records, and giving it an entry would be a second
 * copy of shipped values in a tool.
 *
 * An empty array is a correct state, not a broken one: `variant.ts`, `seed.ts`,
 * `run.ts` and this file all stay whether or not a slot is open. They are the
 * seam, the way `Effects` stays whether or not anything is exploding.
 *
 * ## The slots that have left, and how
 *
 * `ship:hull-skin` / `warm` left this list by being *answered*, which is the
 * only way anything is meant to. The answer was not "violet" or "amber" but
 * both: the amber hull is player two's ship and the violet one is player one's,
 * so the pair can tell whose screen they are looking at without reading a word
 * (`packages/render/src/seat-skin.ts`). A question with a shipped answer is not
 * a question, so the directory went with the entry.
 *
 * `grip:ring-pause` left without a vote, because the question it asked had
 * already been answered somewhere else on the same frame. It asked how the
 * field should say that a body just carried a column cannot be carried again
 * for a beat, and its premise was that nothing said so. Something does: the
 * two white carry arrows beside the body are drawn only while
 * `carryIsReady` (`grip-arrows.ts`), so they go out for the length of the
 * pause and come back with it.
 *
 * `creature:strand` left with its slot decided rather than closed, and `mute`
 * **won and shipped**: the reel rolls at six swaps a second in one violet,
 * which is what `strand-bead.ts` and `strand-reel.ts` now draw.
 *
 * `panel:action-face` left by being *chosen*. The owner looked at SHIELD and
 * SUCK beside the two emblems and picked the pictures, so the membrane that
 * swells into the ward and dips into the throat is what
 * `packages/render/src/action-face.ts` draws on every action button now.
 *
 * `crawler:pulse` left the same way, and by the answer a vote is *most* worth
 * having: the owner looked at the pair and could not tell which side was
 * stepped. The cheaper of the two candidates shipped — sixteen positions, and
 * a contour a renderer bakes once instead of nine times a frame
 * (`packages/content/src/crawler-shape.ts`).
 *
 * ## Seven at once, on 8 September 2026
 *
 * The owner read the whole page and emptied most of it in one sitting, which
 * is the throughput this arrangement was built for. Six were **taken into the
 * game**, and each is now the only answer there is: `creature:magnet` / `coil`
 * (`packages/render/src/magnet-coil.ts`), `creature:skin` / `lit`
 * (`living-skin.ts`), `creature:slick` / `pinch` and `creature:bulb` / `six`
 * (`packages/content/src/silhouettes.ts`), and `creature:dart` / `torch`
 * (`dart-torch.ts`). The seventh, `cannon:shot` / `streak`, was **cut** — no
 * vote, no shipped half, the owner simply did not want the question open.
 *
 * Two of that seven were not decided so much as **rehoused**, and they are the
 * first candidates to leave by moving rather than by winning or losing.
 * `creature:dart` / `wake` and the dart plume `torch` displaced are both on
 * the SHAPES tab's TAIL axis now (`tools/director/src/tails/`), where a mark
 * left behind a falling body sits beside the five others of its kind instead
 * of beside one creature; and `creature:throb` / `crown` is a draft in the
 * shape catalogue (`tools/shape-sheet/src/drafts/creatures.ts`), where a
 * contour is measured against the bodies it could be mistaken for. VERSUS
 * asks *which of these two*, and a look nobody is ready to choose between is
 * better kept where it can be browsed than kept as a question nobody answers.
 *
 * ## Ten answered in one sitting, on 9 September 2026
 *
 * The owner read the page and emptied all but two of it, which is the largest
 * clearance this arrangement has had. Nine were **taken into the game** and are
 * now the only answer there is, and every one of them was written to the
 * direction he named on 8 September: **the graphics should look
 * three-dimensional while staying 2D, and a flying body should turn just enough
 * that what was behind it comes into view.** Each takes a body the game already
 * drew well and argues that what was missing was not more paint but a *placed*
 * surface — a mark at a longitude and a latitude, carried round by a turn,
 * under a light that does not move (`docs/style-guide.md`'s Depth section,
 * `packages/content/src/surface.ts`).
 *
 * `crawler:skin` / `pearl` is `crawler-skin.ts`'s `drawSlime`: every ring a
 * ball with eight pores rolling backwards along the way the worm is going.
 * `creature:throb` / `globe` is `throb.ts`: the seam as a meridian on a ball
 * rather than a diameter on a coin. `creature:choir` / `orbs` is
 * `choir-skin.ts`: two turning bubbles drawn in added light only, which hides
 * less than the wash it replaced. `creature:wisp` / `ring` is
 * `wisp-tentacles.ts`: eight streamers round the hem, half of them behind the
 * bell. `creature:gyre` / `yolk` is `gyre-core.ts`: the organelle shaded in a
 * frame the turn has been taken out of. `creature:veil` / `anvil` is
 * `veil-mass.ts`: nine lit heaps inside the shipped outline. `warden:plates` /
 * `bevel` is `warden-plates.ts`: each plate a slab with a wall and a lit edge.
 *
 * The two about the ship were taken **together**, and that is the point of
 * them: `ship:hull-shape` / `ridge` is fourteen shallow lobes on `HULL`
 * (`packages/content/src/ship-silhouettes.ts`) and `ship:light` / `barrel` is
 * the cosine that lights them (`packages/render/src/hull-barrel.ts`). The owner
 * had rejected the light and then said it might integrate with the shape; it
 * does, and a ripple with a straight ramp across it is a pattern rather than a
 * surface. Two candidates written for the same object turned out to be one
 * answer.
 *
 * `creature:torch` / `kiln` was taken **and changed**, which is the one way out
 * of this list nothing had used before. The owner wanted its fire *much bigger,
 * more like a big fireball*, with the rock still a dark core inside it — so
 * KILN's eighteen rolling tongues are the skin of `torch-fire.ts` and the ball
 * around them is new: a heat halo, two shells turning against each other and
 * nine plumes on a mass of their own, all of it behind the stone.
 *
 * ## Two that stayed
 *
 * `creature:meteor` / `forge` and `creature:skin` / `veil` are what is left of
 * that page, and they are open because he did not answer them rather than
 * because he answered them slowly.
 *
 * ## And one slot opened by an answer, the same day
 *
 * `panel:ship-join` is the first slot on this page the owner *asked for*, and
 * the first with three candidates in it rather than two. He wanted the control
 * panel to look like part of the hull — *ship must more follow visual of
 * control panel, or/and the way around* — and when the three ways of doing that
 * were put to him he chose all three, as cards, so he could see them beside
 * each other rather than be handed one.
 *
 * `roof` makes the panel's ceiling the hull's own ripple, read off the same
 * radius function at the same x. `organs` grows every control out of the
 * membrane as a trunk with a shoulder, a waist and a flare, where the shipped
 * panel hangs a thread to it. `both` is the two at once, and it is a card of its
 * own rather than a summary because the open question about them is whether
 * they add up or fight in a strip the pair reads eleven columns of ammunition
 * against.
 *
 * It needed a seam first, and the seam is `packages/render/src/band-join.ts`
 * — the ninth of `magnet-look.ts`'s kind and the first about two objects
 * rather than one. Two fields, because there are two halves of one question:
 * what shape the ship's underside is, and what stands between it and a button.
 * The shipped paint went through both with not one pixel moved.
 *
 * ## Two about damage, on 9 September 2026
 *
 * `creature:break` / `shatter` and `ship:crater` / `spall` are the first
 * candidates on this page whose subject is what happens **to** something rather
 * than what it is made of, and they are the two halves of one engine:
 * `packages/render/src/shatter.ts` cuts a closed contour into pieces that tile
 * it exactly, and the two slots spend that the two ways there are. The break
 * throws the pieces and lets them land; the crater keeps them where they are
 * and pulls them into the hole. If a cut contour reads as damage both moving
 * and standing still, the engine is worth more than either look.
 *
 * The break's seam is the only one on this page whose **shipped value is
 * nothing**. `BREAK_LOOK.wedges` is 0 and `Debris` therefore draws no pieces at
 * all, which is not an empty stub but the game's real answer: a body destroyed
 * has always thrown a dozen squares and stopped being drawn. So the left-hand
 * side of that pair is the field exactly as it is, and the question the slot
 * asks is whether a kill should leave anything behind — a question the owner
 * had already half-answered before either candidate was written, by saying that
 * if it does, it falls and lands rather than hanging in the lane.
 *

 * ## One about armour, on 9 September 2026
 *
 * `shell:plate` / `slab` is `warden:plates` / `bevel`'s question asked again on
 * a smaller body. The boss's ring of armour was one arc stroked in grey at one
 * brightness the whole way round until the owner took BEVEL into the game; THE
 * SHELL's plating is the same picture on a body a tenth the size, and it is the
 * one hard surface left in the game with no highlight, no bevel and no
 * thickness at all — sitting directly over a body that has both.
 *
 * What is different, and what makes it worth asking twice rather than copying
 * the answer across, is that a shell's plate is *shaped to a contour* instead
 * of swept round a rim. So the light cannot come from where a plate is on a
 * ring; it comes from which half of a body the plate is on, which means an
 * intact shell is two different greys rather than one shape with a seam down
 * it. That is the change the vote is really about.
 *
 * It needed a seam first, `packages/render/src/shell-look.ts`, and it is the
 * first on this page with two fields that must move **together**: the grey edge
 * a chipped half keeps is the same material as the plate beside it, and a look
 * that moved one and not the other would put a body on the field wearing two
 * answers.
 *

 * ## And one on two bodies at once, the same day
 *
 * `eye:iris` / `turn` is the first slot on this page whose subject is drawn on
 * **two** creatures. `lid.ts` and `warden-eye.ts` both call `drawEyeLens`, so
 * one record paints the roundest thing in the game on the small body whose
 * whole picture is an eye and on the biggest fixture the game ever draws. That
 * is why the slot is not named after either of them: a look that improved a lid
 * and spoiled a warden is a vote nobody can cast, and a slot called
 * `creature:lid` would have hidden the question. The pose is the lid, where the
 * difference is largest; `WARDEN · ARMOURED` is the second picture and belongs
 * open beside it.
 *
 * The shipped eye is the roundest thing in the game with no depth on it at all:
 * the iris is concentric with the socket and every mark sits at a fixed screen
 * offset, so an eye *looking somewhere* would be an eye whose whole picture had
 * been slid sideways — which is why it never looks anywhere. TURN pins the iris
 * at a longitude and carries it round on a slow sweep, foreshortened by the
 * tangent plane's own map and losing the light as it goes, under a catchlight
 * drawn outside that transform where the light is. A mark that moves against a
 * mark that does not is the cheapest solid-looking thing there is, and this
 * spends it on two of the biggest bodies in the game at once.
 *
 * The seam it needed is `packages/render/src/eye-look.ts`, and it took the
 * pupil with it: it used to be drawn by `eye-lens.ts` after the ring and the
 * spokes, which was fine while every mark was concentric and is not the moment
 * a look places the iris somewhere — the hole would have stayed behind. What
 * stayed next door is the lens itself, the aperture the lids open, because that
 * is the **readout** the seat without the cord reads a number off and no look
 * may touch it.
 *
 * `bun run breaks` is the bench both were tuned on: every tuning of the engine
 * on one sheet, seven moments across, which is the one thing a running preview
 * cannot show for an effect that is over in a second.
 */
export const VARIANTS: Variant[] = [
  METEOR_FORGE,
  SKIN_VEIL,
  JOIN_ROOF,
  JOIN_ORGANS,
  JOIN_BOTH,
  BREAK_SHATTER,
  CRATER_SPALL,
  SHELL_SLAB,
  EYE_TURN,
];
