import { CREATURES } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";

/**
 * What a click paints. A brush rather than a cell that cycles through six
 * states: authoring a wave means putting the same thing in several columns,
 * and a cycle makes that six clicks instead of one.
 */
export type Brush =
  | "red"
  | "cyan"
  | "rock"
  | "rockMedium"
  | "rockFast"
  | "rockFaster"
  | "rockFastest"
  | "mend"
  | "purge"
  | "ward"
  | "erase";

export const BRUSHES: {
  brush: Brush;
  label: string;
  /** SUBJECTS names drawn on the card. Two means the brush resolves to either. */
  subjects: string[];
  stroke: string;
  note: string;
}[] = [
  {
    brush: "red",
    label: "SLICK",
    subjects: ["SLICK"],
    stroke: PALETTE.red,
    note: CREATURES.slick.blurb,
  },
  {
    brush: "cyan",
    label: "BULB",
    subjects: ["BULB"],
    stroke: PALETTE.cyan,
    note: CREATURES.bulb.blurb,
  },
  {
    brush: "rock",
    label: "METEOR",
    subjects: ["METEOR"],
    stroke: PALETTE.rock,
    note: CREATURES.meteor.blurb,
  },
  {
    brush: "rockMedium",
    label: "METEOR ×2",
    subjects: ["METEOR"],
    stroke: PALETTE.rock,
    note: CREATURES.meteorMedium.blurb,
  },
  {
    brush: "rockFast",
    label: "METEOR ×3",
    subjects: ["METEOR"],
    stroke: PALETTE.rock,
    note: CREATURES.meteorFast.blurb,
  },
  {
    brush: "rockFaster",
    label: "METEOR ×4",
    subjects: ["METEOR"],
    stroke: PALETTE.rock,
    note: CREATURES.meteorFaster.blurb,
  },
  {
    brush: "rockFastest",
    label: "METEOR ×5",
    subjects: ["METEOR"],
    stroke: PALETTE.rock,
    note: CREATURES.meteorFastest.blurb,
  },
  {
    brush: "mend",
    label: "MEND",
    subjects: ["POD"],
    stroke: PALETTE.pod,
    note: "restores hull — the pod as it has always been",
  },
  {
    brush: "purge",
    label: "PURGE",
    subjects: ["POD"],
    stroke: PALETTE.ember,
    note: "clears every creature on the field",
  },
  {
    brush: "ward",
    label: "WARD",
    subjects: ["POD"],
    stroke: PALETTE.shieldRim,
    note: "holds the shield armed for a few beats, no trigger needed",
  },
  {
    brush: "erase",
    label: "ERASE",
    subjects: [],
    stroke: "#574d84",
    note: "takes back whatever is in the cell, entry or pod",
  },
];
