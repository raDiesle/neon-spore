import { CREATURES } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";
import { cardSubjects, livingStroke, SHORT_NOTE } from "./brush-cards.js";
import { type Brush, LIVING_BRUSH_KINDS } from "./brush-lists.js";

/**
 * **What the palette draws**: one row per brush, with a label, a stroke, the
 * silhouettes on its card and the line it says about itself.
 *
 * What a brush *is* — which strings are brushes at all, which kind each one
 * paints — is `brush-lists.ts` next door, cut out on 16 September 2026 when
 * THE FLIP's row took this file past its limit. Every name there is
 * re-exported at the foot of this file, so nothing that reached for one moved.
 *
 * This is the half that grows: a creature, a fault or a rock arrives as a row
 * here and as nothing else, which is why it is the half that was given the
 * room.
 */

const LIVING_BRUSHES: {
  brush: Brush;
  label: string;
  subjects: string[];
  stroke: string;
  note: string;
  detail: string;
}[] = LIVING_BRUSH_KINDS.map((kind) => ({
  brush: kind,
  label: kind.toUpperCase(),
  subjects: cardSubjects(kind),
  stroke: livingStroke(kind),
  note: SHORT_NOTE[kind] ?? CREATURES[kind].blurb,
  detail: CREATURES[kind].blurb,
}));

/**
 * The fault brushes as the palette shows them: a word, and a line about what
 * each one does to the pair.
 *
 * The note is short on purpose — every other brush's is, and this is a palette
 * button rather than a page. The whole sentence is `fault-notes.ts`'s
 * `FAULT_NOTE`, which the panel under the map prints beside the placement as
 * soon as one is on a row.
 */
const FAULT_LOOK: { brush: Brush; label: string; note: string }[] = [
  {
    brush: "fault:cannon",
    label: "CANNON",
    note: "the gun fires itself, player 2 loses both colours",
  },
  {
    brush: "fault:shield",
    label: "SHIELD",
    note: "the dome arms itself, player 1 loses the trigger",
  },
  {
    brush: "fault:steer",
    label: "STEER",
    note: "the cannon walks itself, player 1 loses the strip",
  },
  { brush: "fault:codex", label: "CODEX", note: "the two colours do each other's job, silently" },
  {
    brush: "fault:handover",
    label: "HANDOVER",
    note: "the two panels change screens for a window",
  },
  { brush: "fault:flip", label: "FLIP", note: "one seat's field is drawn mirrored; nothing else" },
  {
    brush: "fault:dark",
    label: "DARK",
    note: "the field goes dark; a touch lights it for two beats",
  },
  { brush: "fault:leech", label: "LEECH", note: "a body on the cannon; keep the cannon moving" },
  { brush: "fault:limpet", label: "LIMPET", note: "a body on the dome; keep the dome moving" },
];

export const BRUSHES: {
  brush: Brush;
  label: string;
  /** SUBJECTS names drawn on the card. Two means the brush resolves to either. */
  subjects: string[];
  stroke: string;
  /** The short line in the palette — what the brush is, at a glance. */
  note: string;
  /** The whole sentence, for the hover card. Absent when `note` is already it. */
  detail?: string;
}[] = [
  ...LIVING_BRUSHES,
  // A fault has no body, so it has no silhouette to draw: the `subjects` list
  // is empty and the button is its word and its line, which is what a pencil
  // laid across a row looks like in a palette of creatures.
  ...FAULT_LOOK.map((f) => ({ ...f, subjects: [], stroke: PALETTE.arc })),
  {
    brush: "rock",
    label: "METEOR",
    subjects: ["METEOR"],
    stroke: PALETTE.rock,
    note: "cannot be shot, ward it",
    detail: "Dead rock. Cannot be shot. Speed and size are set under the map, per rock.",
  },
  {
    brush: "torch",
    label: "TORCH",
    subjects: ["TORCH"],
    stroke: PALETTE.rock,
    note: SHORT_NOTE.torch ?? CREATURES.torch.blurb,
    detail: CREATURES.torch.blurb,
  },
  {
    brush: "veer",
    label: "VEER",
    // Its own card, and it used to be METEOR's. The stone is the same one
    // every rock brush draws, so for a while the palette showed two identical
    // pictures and left the note to tell them apart; the sheet carries the
    // rider now (`shape-sheet/veer-subject.ts`), so the button shows the clown
    // that is the whole difference between this rock and a dead one.
    subjects: ["VEER"],
    stroke: PALETTE.rock,
    note: SHORT_NOTE.veer ?? CREATURES.veer.blurb,
    detail: CREATURES.veer.blurb,
  },
  {
    brush: "purge",
    label: "PURGE",
    subjects: ["POD"],
    stroke: PALETTE.ember,
    note: "clears the field",
  },
  {
    brush: "ward",
    label: "WARD",
    subjects: ["POD"],
    stroke: PALETTE.shieldRim,
    note: "shield stays armed a few beats",
  },
  {
    brush: "erase",
    label: "ERASE",
    subjects: [],
    stroke: "#574d84",
    note: "takes back the cell",
  },
];

/**
 * The creature kind a brush paints, for brushes that paint one at all. Every
 * living brush paints the kind of its own name — `BRUSH_KIND.slick` is
 * `"slick"` — because that is what "a brush is a `CreatureKind`" means; only
 * the rock tiers need a table at all, since `"rock"` and `"meteor"` are not
 * the same string.
 */

// Every name `brush-lists.ts` holds, re-exported: the split is a line-count
// seam and not an interface change, and forty-odd call sites should not have
// learned about it.
export {
  BRUSH_KIND,
  type Brush,
  FAULT_BRUSHES,
  type FaultBrush,
  faultKindOf,
  LIVING_BRUSH_KINDS,
  ROCK_BRUSHES,
} from "./brush-lists.js";
