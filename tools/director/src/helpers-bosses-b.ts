import type { HelperDef } from "./helpers-def.js";
import { STARE_CAUGHT } from "./helpers-poses-bosses.js";

/**
 * ONE BOSS'S OWN, page two: the bosses `view-role-clocks-b.ts` splits, and
 * THE THROAT, whose two handles are each one seat's (`throat-marks.ts`).
 * Out of `helpers-bosses.ts` on line count, in the same shape.
 */
export const CLOCK_B_ROWS: HelperDef[] = [
  {
    name: "THE SCUTTLE'S COUNT AND LIVE PART",
    where: "on the frame's sockets, and on the parts hanging loose under it",
    seat: "P2: which hanging part a shot can take, in its colour, and the lock on the next throw's column — P1: the count",
    says:
      "This one, red. On the navigator's screen every socket is plated, so how " +
      "many throws are left is not hers; on the pilot's no hanging part is " +
      "coloured, so which one to shoot is not his.",
    source: "scuttle-shape.ts, scuttle-draw.ts",
    pose: "THE SCUTTLE · SWUNG",
    role: "p2",
    crop: "top",
    lookAt: "the one coloured part among the loose ones, and the lock on its column",
  },
  {
    name: "THE ANTIPHON'S ORGAN AND RAIL",
    where: "the organ standing in the middle under the rail, and the candidates on their veins",
    seat: "the explainer: the organ — the chooser: the rail, the organ among it unmarked. They swap every level",
    says:
      "Three lobes, the bottom one long — and the left one? Neither seat can point " +
      "at the other's picture, so the shape has to be put into words.",
    source: "antiphon-shape.ts, antiphon-draw.ts",
    pose: "THE ANTIPHON · CYCLING",
    role: "p1",
    lookAt: "the organ growing in the middle, with no rail drawn round it",
  },
  {
    name: "THE HIVE'S SWELL AND COLOUR",
    where: "on the underside, at the site about to open, and in every open breach",
    seat: "P2: the site that bulges in the beats before it opens — P1: the colour of every open breach",
    says:
      "The next one is at seven, hers to say and his to slide to; four is red, his " +
      "to say and hers to fire. Each fact is kept from the seat whose hands could " +
      "answer it.",
    source: "hive-draw.ts",
    pose: "THE HIVE · SWELLING",
    role: "p2",
    lookAt: "the site hanging low under the hive, and no colour in any breach",
  },
  {
    name: "THE INSTAR'S OWN MARKS",
    where: "on the marks over the body, where both screens see every one",
    seat: "BOTH see every mark — the ring is bright with its gesture on its own seat, dim with the owner's name on the other",
    says:
      "Whose mark this is, before anyone finds out the hard way: the seat not asked " +
      "for a mark still watches it answered and can say so.",
    source: "instar-marks.ts",
    pose: "THE INSTAR · ACT",
    role: "p1",
    lookAt: "the rings on P1's own marks, bright, each with its gesture",
  },
  {
    name: "THE STARE'S CATCH",
    where: "on the button that was pressed on an open beat",
    seat: "the seat that pressed — the other is shown the eye going white and the hull's breach",
    says:
      "That was you. The eye freezes both seats, so the only split left is which " +
      "of them it caught; the panel that sent the press flashes.",
    source: "stare-fx.ts",
    pose: STARE_CAUGHT,
    role: "p2",
    lookAt: "the red flash over the panel P2 pressed from",
  },
  {
    name: "THE FILAMENT'S WAY AHEAD",
    where: "the unlit path from the lit end to the root, and the lead into the body",
    seat: "P1 only — P2 sees both thumbs and the lit run, and not where it goes",
    says:
      "Which way the line turns next is the pilot's to say. Both rings are on both " +
      "screens, each seat's own bright with its verb and the other's dim.",
    source: "filament-draw.ts, filament-turn-draw.ts",
    pose: "THE FILAMENT · TRACE",
    role: "p1",
    lookAt: "the unlit path ahead of the lit end, down to the root",
  },
  {
    name: "THE THROAT'S HANDLES",
    where: "on the mouth's two handles: the aim and the pump",
    seat: "P2's the aim, P1's the pump — each seat's own is haloed, the other's is not",
    says:
      "Which hand is yours on a mouth both screens see: the navigator carries it " +
      "over a body, the pilot pumps it wide.",
    source: "throat-marks.ts",
    pose: "THE THROAT · SUCKS",
    role: "p1",
    crop: "ship",
    lookAt: "the halo on the pump handle, and none on the aim",
  },
];
