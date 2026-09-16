import type { CatalogueEntry } from "../catalogue.js";
import { rooted, studded } from "../forms/index.js";
import { SWELL } from "../motions.js";

/**
 * Three shapes were drawn at the Mine (`docs/spec/ideas.md`, Creatures) on
 * 12 September 2026, each saying a different half of its rule. It stands
 * still and is tapped rather than shot; the four tiles round it hurt; it goes
 * off when its fuse runs out.
 *
 * **REACHER won and is on the field**, since 16 September 2026
 * (`packages/content/src/silhouettes-mine.ts`) — its card is gone from here
 * because the sheet draws the shipped body under the creature's own name, and
 * a draft beside it would be the same picture twice under two names.
 *
 * The other two are **free** rather than drafts now: the idea they were
 * offered to is built, so there is no bullet left in `ideas.md` for a
 * suggestion to point at, and a suggestion that names a missing heading is
 * worse than none (`test/drafts.test.ts`). They are still good contours and
 * still say things REACHER does not — that is what `free` means, and it is
 * how the boss cards left the same list on 16 September 2026.
 */

export const MINE_DRAFTS: CatalogueEntry[] = [
  {
    subject: studded("CALTROP", "four needles, one at each tile that hurts", {
      rx: 34,
      ry: 34,
      studs: 4,
      reach: 0.95,
      width: 0.2,
      blunt: 0,
      lobes: 8,
      depth: 0.06,
      seed: 4.4,
    }),
    motion: SWELL,
    status: "free",
    slot: "creature",
    owner:
      "drawn for THE MINE and not chosen — the rule as a picture: a needle stands into each of the four tiles a tap must not land on, and nothing points at the diagonals, which are safe. It swells on the fuse and does nothing else — a body that will go off should look like one filling",
  },
  {
    subject: rooted("SINKER", "a round body held to the field by roots", 30, 28, 8, 1.0, 0.2, 6),
    motion: SWELL,
    status: "free",
    slot: "creature",
    owner:
      "drawn for THE MINE and not chosen — the half the other two leave out: why it does not fall. Roots into the field say fixed, and a fixed body on an empty field is the first thing the pilot should be told about. The roots say nothing about the four tiles — that is the trade, and the card is here so the trade can be seen",
  },
];
