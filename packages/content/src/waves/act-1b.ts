import type { Wave } from "../wave-types.js";

/**
 * The last of act one, cut off `act-1.ts` when that file reached the 250-line
 * ceiling on `CATCH AND AIM`.
 *
 * **`1b` and not `7`, for the reason `acts.ts` gives**: an act file
 * is a page rather than a chapter, so the cut is where the file filled up and
 * the name has to sort where the waves stand. These three are the end of the
 * tutorial arc and they read in one breath — the pod arrives, the hand learns
 * to aim, and then everything at once.
 *
 * **THE BASTION stands between them**, moved here by the director's save of
 * 14 October 2026.
 *
 * **THE BASTION is a metal moon taken apart from the outside in** (the
 * owner, 8 October 2026, in THE HALTER's place: *removing layers requires
 * different actions … the smaller the ball gets*; `sim/bastion.ts`). Four
 * shells, each a different job split across the seats, and **each two courses
 * deep** (the owner, 14 October 2026: *more layers of steps … longer plays*):
 * eight panels pulled off, four a side — the first course mostly straight
 * out, the second along curves round the moon (`sim/bastion-track.ts`); six
 * guns and then eight, turned to the front by the pilot's rim and shot in
 * their colour by the navigator; five nodes twice over, in a new order,
 * whose lightning the shield throws back; three ports and then four, only
 * the navigator sees them, the cannon slid under each. A plate let go short
 * or carried off its curve snaps back, and a course run out grows back whole
 * — nothing hits the hull (THE GRINDSTONE's rule, the owner's pick).
 *
 * New waves still land in the newest act rather than here; the director's save
 * splits an incoming list across the act files at each one's current length
 * (`tools/director/src/waves-acts.ts`).
 */
export const WAVES_ACT_1B: Wave[] = [
  {
    id: "theBastion",
    name: "THE BASTION",
    guide: {
      both: "A metal moon in four layers, each two deep. Take each layer off before it grows back. The moon gets smaller as you go.",
      p1: "1. Pull your left panels along their lines. Stay on the bends.\n2. Turn the moon by its rim. The other shoots the gun at the front.\n3. Fire the SHIELD under the spark.\n4. Slide the cannon under the port.",
      p2: "1. Pull your right panels along their lines. Stay on the bends.\n2. Shoot the gun at the front in its colour.\n3. Slide the shield under the spark.\n4. Only you see the port: say where, then fire.",
    },
    entries: [],
    boss: {
      kind: "bastion",
      steps: [
        { layer: "plates", tracks: ["sweep", "straight", "straight", "straight"], beats: 36 },
        { layer: "plates", tracks: ["snake", "sweep", "snake", "climb"], beats: 48 },
        { layer: "ring", colors: ["red", "cyan", "red", "cyan", "red", "cyan"], beats: 40 },
        {
          layer: "ring",
          colors: ["red", "red", "cyan", "red", "cyan", "cyan", "red", "cyan"],
          beats: 48,
        },
        { layer: "lattice", offsets: [-2, 2, 0, -1, 1], beats: 48 },
        { layer: "lattice", offsets: [1, -2, 0, 2, -1], beats: 48 },
        { layer: "port", offsets: [-2, 1, 0], beats: 32 },
        { layer: "port", offsets: [2, -1, 1, -2], beats: 40 },
      ],
    },
    bossType: "normal",
    controls: "standard5",
  },
  {
    id: "salvage",
    name: "SALVAGE",
    guide: {
      scene: "salvage",
    },
    entries: [
      { beat: 2, col: 2, color: "cyan" },
      { beat: 7, col: 8, color: "red" },
    ],
    pods: [{ beat: 0, col: 5, row: 3, kind: "pod" }],
    controls: "standard5",
  },
  {
    id: "salvageAgain",
    name: "SALVAGE AWAKENS",
    variant: true,
    entries: [
      { beat: 7, col: 6, color: "red" },
      { beat: 14, col: 5, color: "red" },
      { beat: 27, col: 6, color: "red" },
    ],
    pods: [
      { beat: 0, col: 4, row: 3, kind: "pod" },
      { beat: 20, col: 4, row: 3, kind: "pod" },
    ],
    controls: "standard5",
  },
  {
    id: "salvageReach",
    name: "SALVAGE HORIZON",
    variant: true,
    entries: [
      { beat: 6, col: 6, color: "red" },
      { beat: 11, col: 0, color: "red" },
      { beat: 22, col: 6, color: "red" },
      { beat: 27, col: 0, color: "red" },
    ],
    pods: [
      { beat: 0, col: 0, row: 3, kind: "pod" },
      { beat: 17, col: 10, row: 3, kind: "pod" },
    ],
    controls: "standard5",
  },
  {
    id: "salvagePair",
    name: "SALVAGE DUET",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 10, col: 7, color: "red" },
      { beat: 14, col: 8, kind: "torch", color: null },
      { beat: 18, col: 10, color: "red" },
      { beat: 28, col: 4, color: "red" },
      { beat: 34, col: 5, kind: "torch", color: null },
    ],
    pods: [
      { beat: 6, col: 8, row: 3, kind: "pod" },
      { beat: 24, col: 3, row: 3, kind: "pod" },
    ],
    controls: "standard5",
  },
  {
    id: "bulbQueen",
    name: "BULB QUEEN",
    guide: {
      scene: "bulbQueen",
    },
    entries: [],
    pods: [{ beat: 2, col: 5, row: 4, kind: "pod" }],
    boss: { kind: "queen", col: 5, petals: 9 },
    bossType: "normal",
    controls: "standard5",
  },
];
