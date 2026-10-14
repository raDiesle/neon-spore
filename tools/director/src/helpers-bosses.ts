import { midCol } from "@neon-spore/sim";
import { CLOCK_B_ROWS } from "./helpers-bosses-b.js";
import { CLOCK_C_ROWS } from "./helpers-bosses-c.js";
import { CLOCK_D_ROWS } from "./helpers-bosses-d.js";
import type { HelperDef, HelperGroup } from "./helpers-def.js";
import { UNDERTOW_BOWING } from "./helpers-poses-bosses.js";

/**
 * CONTROLS › HELPERS, **ONE BOSS'S OWN**: the picture a boss with a split
 * draws on one seat only — a tally, a zone, a lean — beside the marks every
 * boss shares (`helpers-marks.ts`). A row a boss, framed on the seat the
 * row's first picture is drawn for, with what the other seat is shown
 * instead in its `seat`. Which seat is shown what is decided in
 * `view-role-clocks.ts` and its pages `-b` and `-c`; this is the reader's
 * half of it, a page of rows to each (`helpers-bosses-b.ts`, `-c.ts`).
 */

/** THE SURGE's bulb, close enough that the notches on its seam read. */
const ON_THE_BULB: HelperDef["zoom"] = {
  at: (w) => ({ col: midCol(w.cfg), row: w.cfg.surgeBulbRow }),
  span: 4,
};

/** THE TASTER's crest, which both its marks are written on, above row 0. */
const ON_THE_CREST: HelperDef["zoom"] = {
  at: (w) => ({ col: midCol(w.cfg) - 0.5, row: -0.4 }),
  span: 3,
};

/** THE UNDERTOW to THE LEAD, the bosses `view-role-clocks.ts` splits. */
const CLOCK_ROWS: HelperDef[] = [
  {
    name: "THE UNDERTOW'S BOW",
    where: "the hull's plate lifting in one column, the beats before a lobe comes up through it",
    seat: "P1 only — P2 is shown the lobe the moment it stands, and nothing before",
    says:
      "A lobe is pushing up here, next. The pilot owns the maw and the column, so " +
      "the seat that has to answer the lobe is the seat told where it is coming.",
    source: "undertow-draw.ts",
    pose: UNDERTOW_BOWING,
    role: "p1",
    lookAt: "the hump in the hull's plate, lit violet, where the next lobe will stand",
  },
  {
    name: "THE GORGE'S TALLY AND RING",
    where: "under each lobe, and round the one nearest full",
    seat: "P1: the count in every lobe, a violet tally — P2: which lobe is nearest full, and its colour",
    says:
      "The same beads on both screens and a different sentence about them on each: " +
      "the pilot says one more into the three, the navigator says which one and in " +
      "which colour. On the ring, the mark for the tap that opens the bottom " +
      "bubble is on his screen alone: it is his thumb.",
    source: "gorge-draw.ts, gorge-grip.ts",
    pose: "THE GORGE · ROW",
    role: "p1",
    lookAt: "the violet tally under each bubble",
  },
  {
    name: "THE CURTAIN'S SHADOW AND SOFT LOBES",
    where: "through the fabric, and on its lobes",
    seat: "P2: the core's shadow and its colour through the fabric — P1: which lobes are soft",
    says:
      "Something behind the fabric only this seat can see. The navigator says red, " +
      "two columns left of the middle; the pilot puts a shot into the lobe lit for " +
      "him. Once the core is bare both see it.",
    source: "curtain-draw.ts",
    pose: "THE CURTAIN · COVERED",
    role: "p2",
    crop: "top",
    lookAt: "the core's shadow and colour showing through the fabric",
  },
  {
    name: "THE TASTER'S LEDGER AND NEXT",
    where:
      "written on the crest's ridge, under its middle — and a chevron on it under the column it opens next",
    seat: "P2: the two counts the fan is tasting, in their colours — P1: where the crest opens next",
    says:
      "Both see the whole fan; each is given one number. The navigator says nine " +
      "red to four, give me cyan; the pilot is told the next column a beat sooner " +
      "than the blade shows it. Neither is shown the colour the beam must be.",
    source: "taster-read.ts",
    pose: "THE TASTER · FANNING",
    role: "p2",
    zoom: ON_THE_CREST,
    lookAt: "the red count and the cyan count on the ridge",
  },
  {
    name: "THE SINEW'S ZONE AND SUM",
    where: "on the strain band under the tendon",
    seat: "P1: the zone, where on the band a fibre parts — P2: the sum, where both pulls have got to",
    says:
      "The pilot can say pull to here, the navigator can say more or ease off; " +
      "neither number is on the other's screen. The hold counting is on both.",
    source: "sinew-band.ts",
    pose: "THE SINEW · HELD",
    role: "p1",
    lookAt: "the zone marked on the strain band",
  },
  {
    name: "THE LEDGER'S BEADS AND SOCKET",
    where: "down the cord, and at its root in the hull",
    seat: "P1: the beads coming down and the beats left of each — P2: the socket, its lock and the next column",
    says:
      "His clock, her column. The pilot's cord fades out above the plating, so he " +
      "never sees where a return lands; the navigator is shown the hole it is rooted " +
      "in and where it walks next, and carries the plate there.",
    source: "ledger-cord.ts, ledger-read.ts",
    pose: "THE LEDGER · WHIPPING",
    role: "p1",
    lookAt: "the beads of light on the cord and the cord fading above the hull",
  },
  {
    name: "THE SURGE'S NOTCHES AND PRESSURE",
    where: "on the seam round the bulb",
    seat: "P1: the notches, how many are open and where the next band sits — P2: the pressure",
    says:
      "The pilot knows where, and says let go on the four; the navigator knows how " +
      "much, and counts it there out loud. Neither mark is on the other screen.",
    source: "surge-gauge.ts, surge-draw.ts",
    pose: "THE SURGE · BAND",
    role: "p1",
    zoom: ON_THE_BULB,
    lookAt: "the notches on the seam and the band of the next one",
  },
  {
    name: "THE LEAD'S LEAN AND COLUMN",
    where: "a stalk under the body",
    seat: "P1: the lean, a stalk in the middle of his screen tilting the way it goes — P2: the column, the stalk locked at its foot",
    says:
      "His direction times the pace, her column: the sum is the shot, and a screen " +
      "with both terms on it would have no one to say it to.",
    source: "lead-shape.ts, lead-draw.ts",
    pose: "THE LEAD · RUNNING",
    role: "p1",
    lookAt: "the stalk standing in the middle and leaning the way the body runs",
  },
];

export const BOSS_GROUP: HelperGroup = {
  title: "ONE BOSS'S OWN",
  sub: "the picture a boss with a split draws on one seat only, and what the other seat is shown instead",
  rows: [...CLOCK_ROWS, ...CLOCK_B_ROWS, ...CLOCK_C_ROWS, ...CLOCK_D_ROWS],
};
