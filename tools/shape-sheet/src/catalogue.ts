import type { OwnMotion } from "@neon-spore/content";
import { livingMotion } from "@neon-spore/content";
import type { Subject } from "./contour.js";
import { DRAFTS } from "./drafts/index.js";
import { FREE_CONTOURS } from "./free-contours.js";
import { GROWN_BODIES } from "./grown-bodies.js";
import { JELLY_BODIES } from "./jelly-bodies.js";
import { TURN } from "./motions.js";
import { livingKinds, SUBJECTS } from "./subjects.js";

/**
 * Every contour that has been drawn, and who has it.
 *
 * `SUBJECTS` answers "what does the game draw". This answers the question the
 * director's backlog page asks instead: **which shapes are spare.** A creature
 * in the bestiary is a behaviour and a name with no picture; a contour tuned in
 * `legacy/style-guide.html` and never claimed is a picture with no behaviour.
 * Putting the two lists on one screen is what lets a concept be handed a shape.
 *
 * The free contours are transcribed from that style guide, the same way the
 * taken ones were (`packages/content/src/silhouettes.ts`), and they are sampled
 * through the same radius functions — so a spare shape is judged against the
 * built ones on equal terms, at the same size, in the same still.
 *
 * They live here rather than in `packages/content` on purpose: content is what
 * the game ships, and a contour no creature carries is not content yet. It
 * becomes content on the day something claims it.
 */

/**
 * Whether a creature, a boss or a part of the ship already carries it.
 *
 * `draft` is the third state and the newest: a shape drawn *for* a named idea
 * in `docs/spec/ideas.md` that the idea has not been designed around yet. A
 * free shape is a picture looking for a behaviour; a draft is a picture drawn
 * at a behaviour, which is a proposal and not a decision. It stops being a
 * draft by being claimed — at which point its parameters move into
 * `packages/content` and it becomes `taken` — or by being cut.
 */
export type ShapeStatus = "taken" | "free" | "draft";

/** What a shape could be spent on. */
export type ShapeSlot = "creature" | "ship" | "boss" | "field";

export interface CatalogueEntry {
  subject: Subject;
  status: ShapeStatus;
  slot: ShapeSlot;
  /** Who carries it, or — for a free or draft one — why nothing does. */
  owner: string;
  /**
   * How the whole body moves, on top of the contour's own wobble. Present for
   * anything drawn to be judged in motion; the free contours predate it.
   */
  motion?: OwnMotion;
  /**
   * What this was drawn for, named as the spec names it: an idea in
   * `docs/spec/ideas.md`, or a design in `docs/spec/bosses.md` that has a
   * section and no code. A suggestion in the first case — the shape is offered
   * to the idea and a person decides, the same way a free shape is offered to
   * the bestiary — and in the second a label, because the section already
   * describes the contour.
   */
  suggests?: string;
}

/** Who carries each of the shapes the game draws, keyed by subject name. */
const OWNERS: Record<string, string> = {
  SLICK: "the slick — the flat red one",
  BULB: "the bulb — round and cyan",
  THROB: "the throb — colourless, swells and shrinks on the shared beat",
  POD: "the pod, which is not a creature",
  METEOR: "every rock tier, and the torch that spans three columns",
  "BULB QUEEN": "the queen's shell, and her armoured marks",
  "HULL · PASSIVE": "the ship, shield down",
  "HULL · ARMED": "the ship, shield held open",
  "HULL · MOVING": "the ship, shield strung out behind its head",
  "HULL · MAW": "the ship, the cannon lobe turned inside out",
  WARDEN: "THE WARDEN's ring — the one contour in the game you can see the field through",
  "WARDEN · LOOKING": "the same ring, with the pupil run out to the edge of its travel",
  "WARDEN · OPEN": "the same ring, open: the two beats the core stands in the hole",
};

/**
 * The motion the game gives a shape it already draws, where it gives one.
 *
 * The living kinds are read off `livingKinds()` — the same list `subjects.ts`
 * builds `SUBJECTS` from — rather than named again here by hand, so a kind
 * added to `CREATURES` gets its own-motion on this page the moment it gets a
 * contour, instead of falling back to no motion until somebody edits a second
 * list. `livingMotion` itself still decides *which* motion; today that is
 * `SWAY_PUMP` for the bulb, `HOLD` for the throb and `TILT_RIPPLE` for
 * everything else. `lure` is not in that list at all and must not be: it is
 * drawn as the body it wears, so a card for it would be a second card drawing
 * a shape already on the sheet (`livingKinds`, subjects.ts).
 */
const TAKEN_MOTION: Record<string, OwnMotion> = {
  ...Object.fromEntries(livingKinds().map((kind) => [kind.toUpperCase(), livingMotion(kind)])),
  WARDEN: TURN,
  "WARDEN · LOOKING": TURN,
  "WARDEN · OPEN": TURN,
};

const slotOf = (name: string): ShapeSlot => {
  if (name.startsWith("HULL")) return "ship";
  if (name.startsWith("WARDEN")) return "boss";
  return "creature";
};

const taken: CatalogueEntry[] = SUBJECTS.filter((s) => s.name !== "TORCH").map((subject) => ({
  subject,
  status: "taken",
  slot: slotOf(subject.name),
  owner: OWNERS[subject.name] ?? "drawn by the game",
  motion: TAKEN_MOTION[subject.name],
}));

/**
 * Drafts first, then the free contours, then what the game already draws. The
 * order is the reading order of the question the page asks: here is what has
 * been proposed, here is what is spare, here is what is spent.
 *
 * The grown bodies sit at the end of the spare ones because they are spare in
 * a second sense: not a contour nothing has claimed, but a *combination*
 * nothing has claimed, assembled out of `src/parts/` rather than drawn. See
 * `grown-bodies.ts` for why fourteen of them arrive at once and as `free`, and
 * `jelly-bodies.ts` for the eight that swim.
 */
export const CATALOGUE: CatalogueEntry[] = [
  ...DRAFTS,
  ...FREE_CONTOURS,
  ...GROWN_BODIES,
  ...JELLY_BODIES,
  ...taken,
];
