import { livingMotion, livingSilhouette } from "@neon-spore/content";
import type { CatalogueEntry } from "../catalogue.js";
import { clubbed } from "../forms/index.js";
import { FLOAT, GLIDE } from "../motions/index.js";
import { TURN } from "../motions.js";
import { blob } from "../subjects.js";

/**
 * The bulb's own motion, worn by all five of its alternatives.
 *
 * Not a spare off `motions.ts`. The shipped BULB card carries what
 * `livingMotion("bulb")` hands back, and a card beside it carrying something
 * else would be two differences on one sheet when only one of them is the
 * question. The outline is what is being read here; everything else is held
 * still on purpose.
 */
const BULB_MOTION = livingMotion("bulb");
/** And the slick's, for the same reason, worn by its two kept outlines. */
const SLICK_MOTION = livingMotion("slick");

/**
 * Second answers to bodies the game already draws.
 *
 * A new seam, and the first entry in it arrived by being **moved rather than
 * decided**. VERSUS is where two answers to one shipped look are put side by
 * side at 26 px and at tempo, and it is the right instrument for a question
 * somebody is ready to answer that week. It is the wrong place for a shape
 * nobody is ready to choose about yet: a candidate sitting in that registry is
 * a question on the owner's desk, and a question that is not going to be
 * answered is better filed as a picture that can be browsed.
 *
 * So this is where one goes when it leaves. The status is `free` and the
 * precedent is THE POMMEL in `tower-defence.ts`: a body whose *construction*
 * has been claimed by a creature while this particular tuning of it has not.
 * What the catalogue means by free is a picture with no behaviour behind it,
 * and that is exactly true of a rim nothing on the field wears.
 *
 * They are not `draft`, and the difference is worth stating once. A draft is a
 * shape drawn **at an idea** in `docs/spec/ideas.md` — offered to a behaviour
 * that has been accepted and not built, which is why the test insists every
 * one of them names something that exists. These are drawn at a body that is
 * already on the field, which has no idea-store bullet and never will.
 *
 * ## The bulb's five, on 9 September 2026
 *
 * The owner read `bulb:shape` — five whole outlines for the roundest body in
 * the game, opened because he had asked for completely different shapes for
 * both first bodies — and answered it in one sentence: *keep the current bulb,
 * but move the alternatives somewhere available on the shapes page.* So the
 * shipped six deep lobes stand, and this is where the other five went. It is
 * the second time this file has been filled by that answer rather than by a
 * vote, which is what it is for.
 *
 * They are worth browsing **together**, because between them they cover the
 * whole axis a round body has: BURR is past counting on purpose, CLOVER is the
 * largest count read without counting, SPIKE is the same idea sharpened until
 * it is a hazard, PEBBLE is a body with no feature at all, and PEAR is the only
 * one that changes the proportion rather than the count — which is the first
 * thing `nameability.ts` measures. The shipped bulb sits between CLOVER and
 * BURR, and that is easier to see with all five on one sheet than it ever was
 * two at a time.
 *
 * ## The slick's two motions, on 9 September 2026
 *
 * `slick:motion` was three answers to how the slick moves, and the owner took
 * BANK — the drift that leans into its own travel — and asked for the other
 * two to be neither adopted nor thrown away. So GLIDE and FLOAT are here on
 * the slick's own shipped outline, carrying the motions themselves from
 * `motions/offered.ts`: the contour is held still on purpose, because the
 * motion is what is being read.
 *
 * ## The slick's two outlines, on 9 September 2026
 *
 * `slick:shape` was five whole outlines for the flat body, and the owner took
 * none of them: RAY, FRILL and CHAIN were rejected and went with the slot,
 * their argument surviving only in the commit that removed them, which is the
 * rule `docs/versus.md` sets for a candidate nobody took. COMMA and REVERB he
 * asked to keep as pictures, so they are here on the slick's own motion, the
 * way the bulb's five wear the bulb's. Each keeps its *how it can lose*,
 * because those are the sentences that will decide them if they are ever
 * picked up again.
 */

export const OFFERED_DRAFTS: CatalogueEntry[] = [
  {
    subject: clubbed("THROB · CROWN", "six clubs lifted clear on visible stalks, all alike", {
      rx: 44,
      ry: 44,
      clubs: 6,
      reach: 0.44,
      cap: 0.27,
      neck: 0.32,
      vary: 0.05,
      lobes: 3,
      depth: 0.06,
      seed: 7,
    }),
    motion: TURN,
    status: "free",
    slot: "creature",
    owner:
      "nothing wears it: this is the throb's rim spent the other way, offered on VERSUS as `creature:throb` / `crown` and moved here on 8 September 2026 without a vote. A throb's rim is an instrument rather than decoration — the creature *is* which half is pointing at the cannon, and a ball is the one shape whose rotation cannot be seen, so six knobs were hung round it to give the turn a bearing and a count. The shipped rim is tuned the way an organic rim is: `reach` 0.26 keeps each cap close in, `cap` 0.36 makes it nearly as wide as the gap beside it, and `vary` 0.16 gives every club its own size, which is a good-looking body paid for out of both readings. This spends the same footprint the other way — a longer stalk, a smaller ball, an even ring — so the count is read rather than estimated and the bearing has a visible arm. What it risks is the objection `docs/alive.md` makes: six even knobs on an even ring is a machine, and this game already has a horseshoe and a cage for machinery. It carries TURN, which is the reading it exists for; only an eye at true size settles whether the neck survives 26 px",
  },
  {
    subject: blob(
      "BULB · CLOVER",
      { lobes: 4, depth: 0.34, wobble: 0.045, rx: 52, ry: 52, seed: 1 },
      "four deep lobes — the largest count read without counting",
    ),
    motion: BULB_MOTION,
    status: "free",
    slot: "creature",
    owner:
      "nothing wears it: offered on VERSUS as `bulb:shape` / `clover` and moved here on 9 September 2026 when the owner kept the shipped bulb and asked for the alternatives to live on this page. It argues that six is one too many — four deep lobes round a middle is the largest number a player reads at a glance without going one, two, three, and the whole reason the bulb carries lobes at all is that the count is what the pair says out loud. Deeper than the shipped shape, so each lobe is a thing rather than a scallop. What it risks is that four symmetrical arms is a cross, and a cross is furniture: the shape of a target, a compass, a joint, next to a field that already draws a bracket round a locked body",
  },
  {
    subject: blob(
      "BULB · BURR",
      { lobes: 12, depth: 0.15, wobble: 0.05, rx: 52, ry: 52, seed: 1 },
      "twelve small lobes, past counting on purpose",
    ),
    motion: BULB_MOTION,
    status: "free",
    slot: "creature",
    owner:
      "nothing wears it: `bulb:shape` / `burr`, moved here with the other four on 9 September 2026. It argues that the bulb should be recognised by its *edge quality* rather than by a number — twelve small lobes is not a count anybody will make, it is a burr, a seed head, a thing covered in something, and that is a description a player can give without having counted. It argues directly with what the shipped shape decided: nine shallow lobes was thrown out for being a texture rather than a count, and six was chosen because six can be counted. This says the premise was wrong, and that the way to make a texture work is to go further past counting rather than back from it. It loses the same way its ancestor did if the rim shimmers at 26 px on a contour already breathing on its own clock",
  },
  {
    subject: blob(
      "BULB · SPIKE",
      { lobes: 8, depth: 0.38, wobble: 0.04, rx: 50, ry: 50, seed: 1 },
      "eight deep arms with real gaps between them",
    ),
    motion: BULB_MOTION,
    status: "free",
    slot: "creature",
    owner:
      "nothing wears it: `bulb:shape` / `spike`, moved here with the other four on 9 September 2026. Eight lobes at nearly twice the shipped depth — a starfish rather than a spore, with real gaps between the arms instead of a scalloped rim. Eight is past counting on the fingers, deliberately: this body would be named by how sharp it is rather than by how many arms it has, and no shipped body carries eight. What it risks is that a star is a hazard — deep points are what the game draws on things that hurt, the fence's shards and a broken plate, and a body that looks armed is a body a pair hesitates over",
  },
  {
    subject: blob(
      "BULB · PEBBLE",
      { lobes: 6, depth: 0.07, wobble: 0.17, rx: 54, ry: 50, seed: 7.4 },
      "lobes so shallow they are barely there, under a wobble that blurs them",
    ),
    motion: BULB_MOTION,
    status: "free",
    slot: "creature",
    owner:
      "nothing wears it: `bulb:shape` / `pebble`, moved here with the other four on 9 September 2026. It argues that the bulb should be the body with *no feature at all* — lobes so shallow they are barely a departure from a circle, under a wobble larger than the lobes, so what a player sees is a soft round thing that breathes. Every other body on the field is trying to be recognised by a count or a point; this one would be recognised by having nothing to recognise. It is the opposite end of the slot from SPIKE and the two belong side by side, because the question underneath both is whether the first round body should be busy or plain. What it risks is that a circle is a rock: THE METEOR is the hard round thing at the same size, and with the lobes gone the difference rests entirely on the material and the colour",
  },
  {
    subject: blob(
      "BULB · PEAR",
      { lobes: 1, depth: 0.28, wobble: 0.05, rx: 46, ry: 56, seed: Math.PI / 2 },
      "one lobe on a body taller than it is wide — heavier at the bottom",
    ),
    motion: BULB_MOTION,
    status: "free",
    slot: "creature",
    owner:
      "nothing wears it: `bulb:shape` / `pear`, moved here with the other four on 9 September 2026. It argues that the bulb should stop being symmetrical — one lobe placed by a quarter-turn seed on a body taller than it is wide, a fruit hanging, with a fat end and a narrow one. Every other body in the game is either symmetrical about its long axis or pointed along it; this is the only shape that is simply heavier at the bottom, which is a thing a falling body can honestly be. It is also the only one of the five that changes the *proportion* rather than the count — 46 by 56 against the shipped 52 square — which is the axis `nameability.ts` measures first, and the reason to read it beside the other four rather than alone. What it risks is that tall is the slick's business turned ninety degrees: the two first bodies are told apart mostly by proportion, one long and one round, and a bulb with a proportion of its own spends that difference",
  },
  {
    subject: blob(
      "SLICK · GLIDE",
      livingSilhouette("slick"),
      "the shipped slick, moving by a stroke, a coast and a new heading",
    ),
    motion: GLIDE,
    status: "free",
    slot: "creature",
    owner:
      "nothing wears it: offered on VERSUS as `slick:motion` / `glide` and moved here on 10 September 2026, when the owner took BANK and asked for this one to be kept as a picture. It argues that a thing swimming does not oscillate — FLOAT and BANK are continuous, the body always moving, and a swimmer is not: it pushes, it coasts while the push runs out, then it pushes somewhere else. That is a move and a wait, the shape the shipped SWALLOW has and the other two gave up; this keeps it and makes the move a stroke in a direction rather than a transfer along the axis. The heading turns by a fixed 2.4 radians each stroke, never randomly, so the path wanders without anything being random underneath it, and the body stretches on the push and recovers on the coast with its area held, so the stroke reads as effort rather than as a size change. How it can lose: it is the busiest of the three. A stroke every two beats on every slick in a column is a lot of movement on a screen where the pair is trying to read positions, and the wave that shows it is not a wave with one body on it",
  },
  {
    subject: blob(
      "SLICK · FLOAT",
      livingSilhouette("slick"),
      "the shipped slick, adrift on two slow drifts that never come back into step",
    ),
    motion: FLOAT,
    status: "free",
    slot: "creature",
    owner:
      "nothing wears it: offered on VERSUS as `slick:motion` / `float` and moved here on 10 September 2026, when the owner took BANK and asked for this one to be kept as a picture. It is the plainest reading of his sentence about a slick that is very fluid, floating in all directions: two slow drifts on periods that share no common multiple, so the body traces a path that never visibly repeats, with a lazy roll and a breathing squash under it. Nothing in it is an event — where SWALLOW has a move and a wait, this has neither, and that is the argument. BANK is this same drift with the roll read off its own velocity, and BANK is what was taken, so what this card shows is the half of that answer he did not take: the drift without the attitude. How it can lose: nothing happens. A motion with no event in it gives the pair nothing to say to each other, and SWALLOW's rest is what makes its crossing legible — a body that is always moving may be a body whose movement stops meaning anything",
  },
  {
    subject: blob(
      "SLICK · COMMA",
      { lobes: 1, depth: 0.42, wobble: 0.05, rx: 64, ry: 54, seed: 0 },
      "one deep lobe and a drawn-out tail — a body with a head end, not two sacs",
    ),
    motion: SLICK_MOTION,
    status: "free",
    slot: "creature",
    owner:
      "nothing wears it: offered on VERSUS as `slick:shape` / `comma` against the shipped slick and not taken — moved here on 10 September 2026 when the owner closed the slot with nothing adopted and asked for this one and REVERB to stay as pictures. It argues that the slick should have a head end: one deep lobe on a body a third taller than the shipped one, a tadpole rather than two sacs, with a fat end and a drawn-out one. It is the only outline offered in that slot that is asymmetric along the long axis, which is the cheapest way a shape says which way it is going without anything moving. How it can lose: THE DART already owns a point. The dart is the body that has a direction, and it is the shape a pair has learned to read as steering — a slick with a head is a slick that could be mistaken for one at the size both are drawn, and that is a confusion between two creatures rather than a matter of taste",
  },
  {
    subject: blob(
      "SLICK · REVERB",
      { lobes: 3, depth: 0.24, wobble: 0.06, rx: 72, ry: 42, seed: 6.1 },
      "the REVERB draft's even three-lobed edge, stretched onto the slick — no waist and no head",
    ),
    motion: SLICK_MOTION,
    status: "free",
    slot: "creature",
    owner:
      "nothing wears it: offered on VERSUS as `slick:shape` / `reverb` against the shipped slick and not taken — moved here on 10 September 2026 with COMMA. It was lifted from the drafts rather than invented, which is the rule the owner gave on 9 September 2026: REVERB is a draft creature in `drafts/creatures.ts`, three lobes at depth 0.24 with seed 6.1, deliberately plain so it would not be mistaken for the Herald beside it, and its numbers are here unchanged except for the proportion, stretched from 46 × 40 to the slick's own footprint. It argues that the slick should be even: three lobes at a modest depth carried across a long body, no waist, no head, nothing to count in a hurry — the quietest of the five, there so the loud ones had something to be loud against. How it can lose: plain reads as unfinished. The draft's own note says the contour was kept plain on purpose because the creature's whole idea lived in its motion, and the slick's motion is a drift, not a delay, so the reason that shape was plain does not come with it",
  },
];
