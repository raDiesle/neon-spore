import type { CatalogueEntry } from "../catalogue.js";
import { clubbed } from "../forms/index.js";
import { TURN } from "../motions.js";

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
];
