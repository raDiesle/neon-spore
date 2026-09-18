import {
  aim,
  firstOfKind as at,
  fresh,
  living,
  type Pose,
  type PoseGroup,
  rock,
  run,
  runUntil,
  shoot,
  POSE_TPB as TPB,
} from "./pose-kit.js";

/**
 * The states of the things a wave puts on the field: the creatures. The
 * bosses stood here too, as the two that existed, until 18 September 2026,
 * when every boss got a group of its own in the BOSSES category
 * (`poses-bosses.ts`).
 *
 * A creature is mostly one state — it falls, and the only question is which
 * silhouette and which colour, both of which the brush palette already shows.
 * The rows worth a picture are the ones where a creature is *in* something: a
 * rock full of craters is the rule "a rock cannot be broken" as a picture
 * rather than as a sentence.
 */

const COL = 5;

// The window follows the body **as it is drawn**, which is `pose-kit.ts`'s own
// `firstOfKind`. This file had its own copy, centred on `c.col` and `c.row` —
// the tile the simulation has already written down for the *next* beat, which
// is a beat ahead of the picture. It never showed while these were reference
// cards drawn once at hand-over and never stepped; the moment one of them is
// the pair's pose for an open slot, the rock spends most of every beat off
// its own centre (`versus-crop-follow.test.ts`).

const CREATURES: Pose[] = [
  {
    name: "SLICK · FALLING",
    note: "Flat, wide and always red. It holds its lane and the only thing that answers it is a red shot up its column.",
    crop: "tile",
    at: at("slick"),
    build: () => {
      const w = fresh([living("red", COL)]);
      run(w, TPB * 4);
      return w;
    },
  },
  {
    name: "BULB · FALLING",
    note: "Round, swollen and always cyan. One kind, one colour, one shape — so the word one player says is the same word every time.",
    crop: "tile",
    at: at("bulb"),
    build: () => {
      const w = fresh([living("cyan", COL)]);
      run(w, TPB * 4);
      return w;
    },
  },
  {
    name: "METEOR · CRATERED",
    note: "Four shots into a rock. It keeps its size and its speed and it is no closer to breaking — the craters are the rule made visible, and the shield is the only answer.",
    lookAt:
      "the rim of the rock and the four holes inside it — whether a hit is a mark on the face or a piece missing from the edge (`creature:bite`)",
    crop: "tile",
    at: at("meteor"),
    build: () => {
      const w = fresh([rock(COL)]);
      const cmds = [aim(0, COL)];
      for (let i = 0; i < 6; i++) cmds.push(shoot(TPB + i * TPB, "red"));
      runUntil(w, "a cratered rock", cmds, (x) => (x.creatures[0]?.holes ?? 0) >= 4);
      return w;
    },
  },
  {
    name: "TORCH · TWO COLUMNS",
    note: "The same dead rock twice as wide and the fastest thing in the field. The shield has to cover both columns, and it is what the queen carries on each wing.",
    crop: "tile",
    at: at("torch"),
    build: () => {
      const w = fresh([rock(COL, "torch")]);
      run(w, TPB * 2);
      return w;
    },
  },
];

export const FIELD_GROUPS: PoseGroup[] = [
  {
    title: "CREATURES",
    note: "what a wave puts in a column, and the state worth a picture — bestiary.md",
    poses: CREATURES,
  },
];
