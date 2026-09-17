import type { Wave } from "../wave-types.js";

/**
 * The fifth page of act seven, cut off `act-7d.ts` when THE LEAD would have
 * taken it over the 250-line ceiling: THE SURGE had left it three under.
 *
 * **`7e` and not `9`, for the reason `act-7c.ts` gives about `7c`**: an act
 * file is a page and not a chapter, and the order of the waves is the order
 * of the game. It starts one wave long.
 *
 * **THE LEAD's arrivals are the shots the pair cannot spare.** The body is
 * hit only by a shot put where it *will* be, a beat after it leaves the top
 * — so every body under it costs a shot fired at where something *is*, and
 * a bolt fired at a body is a bolt not in the air over the column the pair
 * has just agreed on. Rocks for the shield, so the cannon can stay on the
 * sum, and a few slicks of both colours at the walls, well apart, so a wrong
 * one is a decision and not a reflex. Once it runs it litters the field
 * itself — a torch in the column it left, a rock in the column a shot has to
 * go to (`sim/lead-step.ts`) — so the authored list thins out from the
 * middle of the wave rather than thickening. Nothing is placed against the
 * body's own column, for THE DIASTOLE's reason: where it is on a beat
 * depends on which shots the pair has landed, which no author can know.
 */
export const WAVES_ACT_7E: Wave[] = [
  {
    id: "theLead",
    name: "THE LEAD",
    sentence: "The one you shoot where it will be, not where it is.",
    guide: {
      both: "A body paces along the top of the field on a stalk of five segments, a column a beat, turning at the walls. A shot out of the top hangs a beat in the air and is judged against the column it is in then — so aim where it will be. A hit takes a segment; a beat every shot missed turns it round. From the fourth segment it runs, dropping a torch behind and a rock ahead. On the last segment it stops dead, and only the beam standing in a column it then passes through ends it.",
      p1: "Only you see which way the stalk leans: where it goes next, and from the second segment the turn a beat early. Say it every beat, left or right, and slide the cannon under the column it will be in, not the one it is in.",
      p2: "Only you see the column it stands in. Read it out every beat; he has where it goes next. Fire the beat he says the cannon is under where it will be: the shot takes a beat to get there. On the last segment, hold the beam.",
    },
    entries: [
      { beat: 10, col: 2, kind: "meteor", color: null },
      { beat: 18, col: 0, color: "red" },
      { beat: 26, col: 4, kind: "meteor", color: null },
      { beat: 36, col: 6, color: "cyan" },
      { beat: 46, col: 1, kind: "meteor", color: null },
      { beat: 58, col: 0, color: "cyan" },
      { beat: 70, col: 5, kind: "meteor", color: null },
      { beat: 84, col: 6, color: "red" },
    ],
    boss: { kind: "lead" },
  },
];
