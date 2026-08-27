import type { World } from "@neon-spore/sim";
import {
  aim,
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
 * The states of the things a wave puts on the field: the creatures, and the
 * two bosses that exist.
 *
 * A creature is mostly one state — it falls, and the only question is which
 * silhouette and which colour, both of which the brush palette already shows.
 * The rows worth a picture are the ones where a creature is *in* something: a
 * rock full of craters is the rule "a rock cannot be broken" as a picture
 * rather than as a sentence, and the queen's two marks are the whole of her
 * fight.
 *
 * The bosses are posed by running their own clocks forward until the phase
 * arrives. Nothing here writes a boss field: a queen whose mark was opened by
 * hand is a queen the game cannot produce, and a reference picture of an
 * impossible frame is worse than none.
 */

const COL = 5;

const at =
  (kind: string) =>
  (w: World): { col: number; row: number } => {
    const c = w.creatures.find((x) => x.kind === kind) ?? w.creatures[0];
    return c ? { col: c.col, row: c.row } : { col: COL, row: 7 };
  };

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

/**
 * Her own column, a tile below her row. Her marks hang under her middle and
 * her wings reach two columns either side, so the frame is centred on the
 * whole reach rather than on the body.
 */
const queenAt = (w: World): { col: number; row: number } => {
  const q = w.creatures.find((c) => c.kind === "queen");
  return { col: q ? q.col : COL, row: (q ? q.row : 2) + 1 };
};

/** A queen fight, from its first beat. Nothing else is on the field. */
function queen(): World {
  return fresh([], [], { kind: "queen", col: COL, petals: 6 });
}

const BOSSES: Pose[] = [
  {
    name: "QUEEN · SHUT",
    note: "Armoured, holding her row, both marks blank. Nothing that reaches her while she is like this takes a petal.",
    crop: "tile",
    span: 8,
    at: queenAt,
    build: () => {
      const w = queen();
      run(w, TPB * 2);
      return w;
    },
  },
  {
    name: "QUEEN · OPEN",
    note: "A bloom. One of the two marks under her is real and the other is a lie that looks identical — one player is told which side, the other which colour, and neither can fire on their half alone.",
    crop: "tile",
    span: 8,
    at: queenAt,
    build: () => {
      const w = queen();
      runUntil(w, "an open bloom", [], (x) =>
        Boolean(x.creatures.find((c) => c.kind === "queen")?.color),
      );
      run(w, 6);
      return w;
    },
  },
  {
    name: "QUEEN · A TORCH DROPS",
    note: "Every eight beats a torch falls straight out of its socket on one wing, and a new one grows in behind it. The fight is a boss and a rock at the same time.",
    crop: "tile",
    span: 9,
    at: queenAt,
    build: () => {
      const w = queen();
      runUntil(w, "a torch off the wing", [], (x) => x.creatures.some((c) => c.kind === "torch"));
      run(w, 10);
      return w;
    },
  },
  {
    name: "MIRROR · PERFORMING",
    note: "The ship upside down and in the wrong colours, doing a sequence with the band locked. Watching is the only thing either player can do, which is the fight.",
    crop: "full",
    build: () => {
      const w = mirror();
      runUntil(w, "a sequence being shown", [], (x) =>
        Boolean(x.boss?.kind === "mirror" && x.boss.phase === "show" && x.boss.shown > 0),
      );
      return w;
    },
  },
  {
    name: "MIRROR · LISTENING",
    note: "The band is back and the row above it says how much of the sequence has been answered. The steps are controls, drawn as the same buttons the band draws.",
    crop: "full",
    build: () => {
      const w = mirror();
      runUntil(w, "a round being listened to", [], (x) =>
        Boolean(x.boss?.kind === "mirror" && x.boss.phase === "listen"),
      );
      run(w, 10);
      return w;
    },
  },
];

/** A short mirror fight — two rounds is enough to reach every phase. */
function mirror(): World {
  return fresh([], [], {
    kind: "mirror",
    rounds: [
      ["fireRed", "guard"],
      ["cannonLeft", "fireCyan", "intake"],
    ],
  });
}

export const FIELD_GROUPS: PoseGroup[] = [
  {
    title: "CREATURES",
    note: "what a wave puts in a column, and the state worth a picture — bestiary.md",
    poses: CREATURES,
  },
  {
    title: "BOSSES",
    note: "the two that exist, at the moment each fight turns on — bosses.md",
    poses: BOSSES,
  },
];
