import type { Gesture } from "./gesture-types.js";

/**
 * The gestures the game reads today, second half: everything where the finger
 * — or the phone — **moves**, and the two that are about how many hands there
 * are. `gesture-built.ts` has the ones that stay put.
 */

export const BUILT_MOVING: readonly Gesture[] = [
  {
    name: "DRAG, AS A DISPLACEMENT",
    state: "built",
    does: "Grab a thing and carry it. What crosses the wire is how far from the grab, never a speed, so a lost move heals on the next. The tether, the balloon, THE SINEW, the lid, THE HIVE.",
    hand: [
      { k: "body", at: [30, 40], r: 10 },
      {
        k: "path",
        pts: [
          [30, 40],
          [44, 58],
          [62, 74],
        ],
      },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1] },
        { event: "pointermove", marks: [[1.3, 7.7]] },
        { event: "pointerup", marks: [8] },
      ],
      note: "each move says: this far from the grab",
    },
    where: ["packages/sim/src/drag-targets.ts", "packages/render/src/touch.ts"],
  },
  {
    name: "SWIPE PAST A DISTANCE",
    state: "built",
    does: "A carry that counts once it has gone far enough, in its own direction — THE GUM flung left or right, THE INSTAR's egg swiped off, counted on the lift.",
    hand: [
      { k: "body", at: [58, 44], r: 9 },
      {
        k: "path",
        pts: [
          [58, 44],
          [16, 50],
        ],
      },
      { k: "text", at: [10, 70], text: "far enough = flung" },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [2] },
        { event: "pointermove", marks: [[2.3, 5.7]] },
        { event: "pointerup", marks: [6] },
      ],
      window: { from: 4.5, to: 6, label: "past the threshold" },
    },
    where: ["packages/sim/src/gum.ts", "packages/sim/src/instar-hand.ts"],
  },
  {
    name: "ROUND A CIRCLE",
    state: "built",
    does: "A finger going round and round: the crank winds THE CLAW's rope home, THE GIMBAL's rings turn. It says where it is on the circle, not how far it came.",
    hand: [
      { k: "arc", c: [46, 128], r: 14, from: 20, to: 330 },
      { k: "touch", at: [46, 114] },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1] },
        { event: "pointermove", marks: [[1.2, 8.8]] },
        { event: "coalesced", marks: [[1.2, 8.8]] },
        { event: "pointerup", marks: [9] },
      ],
      note: "coalesced samples keep fast turns right",
    },
    where: [
      "packages/sim/src/crank.ts",
      "packages/sim/src/bearing.ts",
      "apps/game/src/coalesced.ts",
    ],
  },
  {
    name: "TRACING A PATH",
    state: "built",
    does: "A drag that only counts along a line the field already shows: the next tile lights, one a beat, and a thumb that jumps ahead snaps it. THE FILAMENT.",
    hand: [
      {
        k: "path",
        pts: [
          [14, 90],
          [30, 70],
          [26, 50],
          [48, 36],
          [70, 44],
        ],
      },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1] },
        { event: "pointermove", marks: [[1.3, 8.7]] },
        { event: "pointerup", marks: [9] },
      ],
      beats: [2.5, 4.5, 6.5, 8.5],
      note: "one tile per beat, no faster",
    },
    where: ["packages/sim/src/filament-hand.ts"],
  },
  {
    name: "TWO THUMBS ON ONE PHONE",
    state: "built",
    does: "One player, two fingers at once — a thumb on the strip and one on a lobe. Each pointer is tracked by its own id.",
    hand: [
      { k: "hold", at: [20, 128] },
      { k: "touch", at: [72, 128] },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1] },
        { event: "pointerdown", finger: 2, marks: [4] },
        { event: "pointerup", finger: 2, marks: [5] },
        { event: "pointerup", marks: [8] },
      ],
      note: "② has its own pointerId",
    },
    where: ["apps/game/src/input.ts"],
  },
  {
    name: "BOTH SEATS IN ONE WINDOW",
    state: "built",
    does: "A thumb each, on the same few beats, on two phones. THE BATON's merge, THE PULSE's arrest, THE BALLOON's pair. Graded on the beat, so the voice delay does not matter.",
    hand: [
      { k: "hold", at: [30, 50] },
      { k: "text", at: [18, 80], text: "+ the other phone" },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [2] },
        { event: "pointerdown", finger: 2, marks: [3] },
        { event: "pointerup", marks: [8] },
        { event: "pointerup", finger: 2, marks: [8.5] },
      ],
      beats: [2, 4, 6, 8],
      window: { from: 3, to: 8, label: "both held" },
    },
    where: ["packages/sim/src/baton-pair.ts", "packages/sim/src/pulse-hand.ts"],
  },
  {
    name: "SHAKE",
    state: "built",
    does: "The phone shaken, THE CHOIR's control and the only input not on the glass. Two arrows on the field do the same thing, always, for the phones that never report motion.",
    hand: [],
    phone: { shake: true },
    timeline: {
      lanes: [{ event: "devicemotion", marks: [[1, 9]] }],
      window: { from: 3, to: 6, label: "hard enough: one command" },
      note: "iPhone: silent until the permission is asked",
    },
    where: ["apps/game/src/shake.ts", "packages/sim/src/choir-gesture.ts"],
    platform:
      "Android reports it. An iPhone asks for permission from a tap first, and the game does not ask yet, so the arrows carry iPhone players.",
  },
];
