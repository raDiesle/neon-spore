import type { CatalogueEntry } from "../catalogue.js";
import { pile, plated, vane } from "../forms/index.js";
import { LURCH, SHIVER, TOLL, TWITCH } from "../motions.js";

/**
 * The three bosses collected by reading Spaceteam and Lovers in a Dangerous
 * Spacetime at boss scale — `docs/spec/transfers-bosses.md`, section
 * "Collected" — rather than by working forward from the idea store.
 *
 * They are filed apart from `bosses.ts` because they came from somewhere else,
 * and because that file is the Warden plus the encounters that lost the slot
 * to it. These lost nothing; they were found. Two of the three had a mechanic
 * written out in full and no body at all, which is the wrong way round for a
 * game where a boss's health *is* its silhouette — the page says so itself and
 * then lists the empty slots. This is that gap closed.
 *
 * A shape is still only part of a proposal. What it settles is the question
 * that cannot be settled in prose: whether the sentence was describing
 * something that can exist at 390 px wide.
 */

/**
 * Seven columns of an eleven-column field. At 390 px that is 248 px across, so
 * a half-width of 124 and — with seven plates — a plate exactly one column
 * wide. That is not a coincidence to be tidied away later: the mechanic is
 * "which column is live", and a plate that spans anything other than one
 * column is a body arguing with the grid it is asking a question about.
 */
const TITHE = { rx: 124, ry: 30, plates: 7, drop: 9, dwell: 3.5 };

/**
 * A unit is a rock, at the size and facet count the game already draws one:
 * `METEOR` is seven-sided and the sheet renders it at 46. That is the whole
 * fiction made literal — the boss dismantles into ordinary rocks, so the parts
 * it is stacked from have to be ordinary rocks before anything is pulled, not
 * boss-sized lumps that shrink on the way out.
 *
 * `courses` stacks seven of them three, three and one, which lands at roughly
 * 240 by 210 — a shade wider than it is tall, so it reads as a cairn rather
 * than a wall, and a shade bigger than the Warden, which is where a boss
 * built out of seven of anything ends up.
 */
const CAIRN = { units: 7, radius: 46, sides: 7, seed: 4.0 };

/**
 * The far end of the sweep, and the *other* end from the one THE CONDUCTOR's
 * card stands at. The arm's bend at the tip is `sin((t + phase) * 0.9 - 1.4)`,
 * which is already near an extreme at `t = 0` — so this does not move the arm
 * further over, it moves it to the opposite side. Worth having anyway: the two
 * cards sit in the same catalogue and should not read as one shape drawn
 * twice. What actually separates them is the bearing.
 */
const FAR_END = 3.3;

export const COLLECTED_DRAFTS: CatalogueEntry[] = [
  {
    subject: vane("THE VANE", "an arm, and the bearing it is exposed at", {
      length: 150,
      curve: 0.9,
      hub: 18,
      phase: FAR_END,
    }),
    motion: TOLL,
    status: "draft",
    slot: "boss",
    suggests: "THE VANE",
    owner:
      "the pendulum drawn for THE CONDUCTOR with the thing it turns on finally in the picture: the pivot is the only part that can be hit and it is exposed at one end of the sweep, the end belonging to the player whose columns were just reversed — so the one who has to shoot is the one whose numbers stopped matching, and a card without the bearing on it was a picture of the part you cannot hit",
  },
  {
    subject: plated("THE TITHE", "a slab of seven columns; one plate reaches", {
      ...TITHE,
      live: 3,
    }),
    motion: TWITCH,
    status: "draft",
    slot: "boss",
    suggests: "THE TITHE",
    owner:
      "the first boss wider than the middle of the field, and a body that is mostly edge: the live plate is not lit, it *reaches*, because a silhouette has no colours and the pair are reading it at 26 px — one plate hanging two and a half times as far is the only part of the outline that moves, and it steps one column every cycle",
  },
  {
    subject: plated("THE TITHE · EDGE", "the live plate at the far end of the body", {
      ...TITHE,
      live: 0,
    }),
    motion: TWITCH,
    status: "draft",
    slot: "boss",
    suggests: "THE TITHE",
    owner:
      "the case the whole shape has to survive: a demand in the outermost column of seven, which is where 'which part of a long thing is live' is a fine distinction rather than an obvious one — if this card reads, the body works, and if it does not, no amount of tuning the middle will save it",
  },
  {
    subject: pile("THE CAIRN", "seven rocks in one outline, seams left to count", CAIRN),
    motion: SHIVER,
    status: "draft",
    slot: "boss",
    suggests: "THE CAIRN",
    owner:
      "the first boss that is a pile rather than a body, and the first drawn with facets instead of lobes: each unit contributes its own polygon rather than a metaball, so the outline creases where two units meet instead of bulging, and the seams survive into the silhouette — which matters because counting the units is counting the fight",
  },
  {
    subject: pile("THE CAIRN · PULLED", "one unit dragged clear — now it is only a rock", {
      ...CAIRN,
      pull: { unit: 3, dx: -3.1, dy: 0.25 },
    }),
    motion: LURCH,
    status: "draft",
    slot: "boss",
    suggests: "THE CAIRN",
    owner:
      "the encounter in one picture: a grip drags a unit out and it stops being part of the boss, becoming a second loop and then an ordinary rock to be warded like any other — the notch it leaves is why the pile has to be traced rather than marched, and the whole fight is how many of these the pair can have in the air at once",
  },
];
