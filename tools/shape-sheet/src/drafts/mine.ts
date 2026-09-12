import { livingMotion } from "@neon-spore/content";
import type { CatalogueEntry } from "../catalogue.js";
import { bloom, rooted, studded } from "../forms/index.js";
import { SWELL } from "../motions.js";

/**
 * Three shapes drawn at the Mine (`docs/spec/ideas.md`, Creatures) on
 * 12 September 2026, each saying a different half of its rule. It stands
 * still and is tapped rather than shot; the four tiles round it hurt; it goes
 * off when its fuse runs out. Its own file because `creatures.ts` was at the
 * length ceiling, and because the three are meant to be read together: which
 * half of the rule a silhouette should carry is the question, and it is easier
 * to ask with the three answers side by side.
 */

/** The throb's stillness, worn by the card whose arms carry all the motion. */
const HOLD = livingMotion("throb");

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
    status: "draft",
    slot: "creature",
    suggests: "Mine",
    owner:
      "the rule as a picture: a needle stands into each of the four tiles a tap must not land on, and nothing points at the diagonals, which are safe. It swells on the fuse and does nothing else — a body that will go off should look like one filling",
  },
  {
    subject: bloom(
      "REACHER",
      "four soft arms, each feeling into a neighbour on its own clock",
      24,
      4,
      1.5,
      4,
    ),
    motion: HOLD,
    status: "draft",
    slot: "creature",
    suggests: "Mine",
    owner:
      "the same four tiles, said the other way: not spikes but arms, each reaching into its neighbour and drawing back in its own time, so the danger zone is a thing that moves while the body never does. The looser of the two on purpose — read beside CALTROP at 26 px to see whether soft reads as dangerous at all",
  },
  {
    subject: rooted("SINKER", "a round body held to the field by roots", 30, 28, 8, 1.0, 0.2, 6),
    motion: SWELL,
    status: "draft",
    slot: "creature",
    suggests: "Mine",
    owner:
      "the half the other two leave out: why it does not fall. Roots into the field say fixed, and a fixed body on an empty field is the first thing the pilot should be told about. The roots say nothing about the four tiles — that is the trade, and the card is here so the trade can be seen",
  },
];
