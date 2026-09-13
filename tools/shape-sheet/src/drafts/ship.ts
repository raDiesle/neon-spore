import type { CatalogueEntry } from "../catalogue.js";
import { COLUMN, held, lips, membrane, traded, welt } from "./membrane.js";

/**
 * Four marks on the ship's own skin, for the four ideas that had none — three
 * of them still ideas, and the fourth built since (`HULL · TRADED`, below).
 *
 * The asset catalogue named the gap and half-named the reason: what was left
 * undrawn was *The breach*, *The Patch*, *The Other Hand* and *Handover*, and
 * the thing they have in common is not a mood, it is a surface. Every one of
 * them is the ship saying something about one column — it gave way, it is being
 * held shut, somebody's thumb is down over it, the two of you have just swapped
 * what you own. None is a body, so none was drawable as a blob, and that is
 * why four ideas sat there while fifteen creatures got pictures.
 *
 * All four are the same span at the same scale, so the page compares them
 * against each other and against HULL · PASSIVE without a scaling step in the
 * middle. The features are one column wide, measured off the drawn hull rather
 * than typed: a mark that is not exactly a column is a ship arguing with the
 * grid the pair names things in.
 *
 * None of them carries an own-motion, and that is the rule rather than an
 * omission. The hull is fixed — it is the sentence the whole game is built on —
 * so everything these cards do happens *in the contour*: the lobe rises and
 * goes out, the two lobes trade, the tear does not heal.
 */

/** Six and a half columns of the field: wide enough that a column is a part. */
const SPAN = 0.25;

export const SHIP_DRAFTS: CatalogueEntry[] = [
  {
    subject: membrane("HULL · TORN", "a column that stopped holding", {
      halfArc: SPAN,
      at: -1,
      lift: lips(8, COLUMN * 0.9),
      gap: COLUMN / 2,
    }),
    status: "draft",
    slot: "ship",
    suggests: "The breach",
    owner:
      "the first card in the catalogue that is not one stroke: the skin over one column is gone, so the ship's outline comes in two pieces and the field is visible between them. Everything else the hull does is a swelling, which is why a breach could not be said with a bump — a column that opened has to stop the line, and the lips curl up at the tear so it reads as something that happened rather than a hatch the ship was built with",
  },
  {
    subject: membrane("HULL · MENDED", "the same column, held shut", {
      halfArc: SPAN,
      at: -1,
      lift: welt(7),
      gap: 0,
    }),
    status: "draft",
    slot: "ship",
    suggests: "The Patch",
    owner:
      "the idea store says the Patch and the breach are one scar from two sides, so they are one card from two sides: the same span, the same column, and the only difference is whether the line is broken. The welt is flat-topped with short shoulders because everything the ship does by itself is a long-shouldered swelling — if a held seam and an armed shield read alike at 26 px then the hull cannot carry a patch, and that is the whole question",
  },
  {
    subject: membrane("HULL · HELD", "a lobe up while the other pair of hands is full", {
      halfArc: SPAN,
      at: 1.5,
      lift: held(6, 3.4),
      gap: 0,
    }),
    status: "draft",
    slot: "ship",
    suggests: "The Other Hand",
    owner:
      "the idea says a lobe *brightens* while the partner holds something, and a silhouette has no brightness — so it stands up instead, the same answer THE TITHE's live plate gave. Its risk is named in advance and is the reason to draw it: the ship already raises one lobe, for the shield, and a second raised lobe may simply be read as a shield in the wrong column. Shorter and a full column wide, against the shield's taller and narrower — that is the entire margin",
  },
  {
    subject: membrane("HULL · TRADED", "two lobes exchanging what they carry", {
      halfArc: SPAN,
      at: 0,
      lift: traded(8, COLUMN * 1.5, 5),
      gap: 0,
    }),
    status: "free",
    slot: "ship",
    owner:
      "the swap has to be announced by the ship rather than agreed beforehand, and an exchange is the one thing a single mark cannot say: it takes two, and they have to cross. Three columns apart, complementary heights, five seconds a cycle — so there is a moment when they are equal and nobody owns anything, which is either the clearest instant on the card or the one that ruins it. **The idea it was drawn at was built on 13 September 2026** as THE HANDOVER, the fifth malfunction, and it is not what shipped: the announcement is a plate on the lip of the band counting the trade down and counting the panels back, over a band that comes up in the other seat's colours with the other seat's buttons in it. So this is no longer a shape offered to a concept — it is a second answer to a question the game has already answered on the screen, which is VERSUS's business and not this page's (`docs/looks.md`). Free until somebody carries it there; `docs/queue.md` has the entry",
  },
];
