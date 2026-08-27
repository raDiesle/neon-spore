import type { CreatureSilhouette, CrystalSilhouette, OwnMotion } from "@neon-spore/content";
import { livingMotion } from "@neon-spore/content";
import type { Subject } from "./contour.js";
import { DRAFTS } from "./drafts/index.js";
import { TURN } from "./motions.js";
import { blob, crystal, hullArc, SUBJECTS } from "./subjects.js";

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

/**
 * Five spiky lobes with a fast, nervous shiver. Drawn in the style guide as
 * "Wespe" and never carried by anything: the marine and insect names went with
 * the setting (`docs/decisions.md` #11, #13), the contour did not. A creature
 * that takes it gets a name of its own out of the bestiary's naming rules —
 * this is a shape, not a name.
 */
const SPIKE: CreatureSilhouette = {
  lobes: 5,
  depth: 0.3,
  wobble: 0.11,
  rx: 42,
  ry: 42,
  seed: 3.0,
};

/**
 * Long, narrow and almost unlobed, with a slow slither across its whole
 * length — the style guide's "Wurm". The one drawn contour that is taller than
 * it is wide, which is why it reads as different at 26 px rather than as
 * another blob in another tint.
 */
const RIBBON: CreatureSilhouette = {
  lobes: 1,
  depth: 0.08,
  wobble: 0.09,
  rx: 26,
  ry: 72,
  seed: 4.0,
};

/** The style guide's crystal patch: a small faceted plate laid on the hull. */
const PATCH: CrystalSilhouette = {
  sides: 6,
  depth: 0.15,
  wobble: 0.02,
  seed: 7.0,
};

/** A ring of light, which is a circle: no lobes, no depth, no breathing. */
const RING: CreatureSilhouette = {
  lobes: 1,
  depth: 0,
  wobble: 0,
  rx: 34,
  ry: 34,
  seed: 0,
};

/** Who carries each of the shapes the game draws, keyed by subject name. */
const OWNERS: Record<string, string> = {
  SLICK: "the slick — the flat red one",
  BULB: "the bulb — round and cyan",
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

/** The motion the game gives a shape it already draws, where it gives one. */
const TAKEN_MOTION: Record<string, OwnMotion> = {
  SLICK: livingMotion("slick"),
  BULB: livingMotion("bulb"),
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

const free: CatalogueEntry[] = [
  {
    subject: blob("SPIKE", SPIKE),
    status: "free",
    slot: "creature",
    owner: "nothing — tuned for a name the setting no longer has",
  },
  {
    subject: blob("RIBBON", RIBBON),
    status: "free",
    slot: "creature",
    owner: "nothing — the one contour taller than it is wide",
  },
  {
    subject: crystal(
      "BURNING ROCK",
      { sides: 9, depth: 0.22, wobble: 0.02, seed: 8.0 },
      70,
      "9 facets · deeper than the meteor's",
    ),
    status: "free",
    slot: "creature",
    owner:
      "no creature — the live torch draws as a plain meteor, and this survives only as the shape the flare clones",
  },
  {
    subject: hullArc(
      "RIM ARC",
      "a span of the hull's own edge, thickened where the shield sits",
      0.22,
    ),
    status: "free",
    slot: "ship",
    owner: "nothing — the shield became a lobe of the contour instead",
  },
  {
    subject: crystal("CRYSTAL PATCH", PATCH, 30, "6 facets · a plate laid on the hull"),
    status: "free",
    slot: "ship",
    owner: "nothing — one of the four shield ideas the style guide drew",
  },
  {
    subject: blob("GLOW RING", RING),
    status: "free",
    slot: "ship",
    owner: "nothing — light rather than silhouette, which is why it lost",
  },
];

/**
 * Drafts first, then the free contours, then what the game already draws. The
 * order is the reading order of the question the page asks: here is what has
 * been proposed, here is what is spare, here is what is spent.
 */
export const CATALOGUE: CatalogueEntry[] = [...DRAFTS, ...free, ...taken];
