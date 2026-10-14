import type { Wave } from "../wave-types.js";

/**
 * Act fourteen, its second page, opened for THE BASTION on 14 October 2026
 * when its second courses took `act-14.ts` to the 250-line ceiling. It plays
 * straight after that page (`waves.ts`).
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
 */
export const WAVES_ACT_14B: Wave[] = [
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
  },
];
