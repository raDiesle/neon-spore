import type { Variant } from "../variant.js";
import { CRAWLER_PEARL } from "./crawler-skin/pearl/index.js";
// region: candidates
import { CHOIR_ORBS } from "./creature-choir/orbs/index.js";
import { GYRE_YOLK } from "./creature-gyre/yolk/index.js";
import { METEOR_FORGE } from "./creature-meteor/forge/index.js";
import { SKIN_VEIL } from "./creature-skin/veil/index.js";
import { THROB_GLOBE } from "./creature-throb/globe/index.js";
import { WISP_RING } from "./creature-wisp/ring/index.js";
import { HULL_RIDGE } from "./ship-hull/ridge/index.js";
import { SHIP_BARREL } from "./ship-light/barrel/index.js";
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
 * ## Three about a surface, on 9 September 2026
 *
 * `crawler:skin` / `pearl`, `creature:throb` / `globe` and `creature:choir` /
 * `orbs` are the first candidates written to the direction the owner named on
 * 8 September: **the graphics should look three-dimensional while staying 2D,
 * and a flying body should turn just enough that what was behind it comes into
 * view.** Each of the three takes a body the game already draws well and argues
 * that what is missing is not more paint but a *placed* surface — a mark at a
 * longitude and a latitude, carried round by a turn, under a light that does
 * not move (`docs/style-guide.md`'s Depth section, `packages/content/src/
 * surface.ts`).
 *
 * They are three rather than one because the rule is cheap on some bodies and
 * dangerous on others, and the only honest way to find the line is to put it on
 * three of them at the sizes they ship at. A worm's ring is forty pixels and
 * has a wave running down it already; a throb is the one body in the game that
 * *turns by rule*, so the cue costs nothing and the risk is to a readout the
 * pair fires against; a choir's voice is under a fifth of a tile, which is
 * where a placed mark stops being a mark. Each candidate's own file says how it
 * expects to lose, and none of the three answers for the others.
 *
 * Each also needed a **seam** first, which is the price `docs/versus.md` names
 * and the reason the earliest slots were the ones that needed none:
 * `crawler-look.ts`, `throb-look.ts` and `choir-look.ts` are three new records
 * of `magnet-look.ts`'s kind, and the shipped paint went through them with not
 * one pixel moved.
 *
 * ## Two more bodies and a ship, the same day
 *
 * `creature:wisp` / `ring` and `creature:gyre` / `yolk` carry the same argument
 * onto the two creatures that were **already exempt from falling**, which is
 * what makes them the best subjects on the roster for it: a wisp stands and
 * jumps rather than coming down a column, and a settled gyre stays, so both are
 * on screen for as long as anybody wants to look — and a surface that turns is
 * the one thing a two-second replay cannot show. `poses-surface.ts` holds both,
 * and they are the first poses on this page that need no cadence at all.
 *
 * `ship:hull-shape` / `ridge` is not about a surface and is here because the
 * owner asked for an alternative to the ship. It is the plainest kind of
 * candidate there is — three numbers on a record `packages/content` already
 * exports, no seam, no paint — and the largest change on the page: the hull's
 * radius function goes from two deep lobes to fourteen shallow ones, so the
 * membrane the whole field is read against ripples instead of swelling. It sits
 * on `HULL · BOTH LOBES UP` beside `ship:light`, which is the same object asked
 * a different question — where the light falls on it, against what shape it is.
 */
export const VARIANTS: Variant[] = [
  METEOR_FORGE,
  SKIN_VEIL,
  SHIP_BARREL,
  CRAWLER_PEARL,
  THROB_GLOBE,
  CHOIR_ORBS,
  WISP_RING,
  GYRE_YOLK,
  HULL_RIDGE,
];
