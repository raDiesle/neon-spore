import type { Gesture } from "./gesture-types.js";

/**
 * The gestures the game reads today, first half: everything a finger does
 * **without travelling** — a press, a hold, a lift, a count, a rhythm. The
 * ones that move are `gesture-built-moves.ts`, split on line count along that
 * seam. Every `where` is a file in the tree, and `test/gestures.test.ts`
 * fails the day one of them is moved or deleted.
 */

export const BUILT_STILL: readonly Gesture[] = [
  {
    name: "TAP",
    state: "built",
    does: "A finger down and up in one place. Every press in the game begins as this: a panel button, the maw, the shield, a falling creature.",
    hand: [{ k: "touch", at: [46, 128] }],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [3] },
        { event: "pointerup", marks: [4.5] },
      ],
      note: "the press is the down; the up only ends it",
    },
    where: [
      "apps/game/src/input.ts",
      "packages/render/src/touch.ts",
      "packages/render/src/touch-ship.ts",
    ],
  },
  {
    name: "TAP OR HOLD, ON ONE CONTROL",
    state: "built",
    does: "The colour lobes: a tap fires a shot; a thumb kept on the same colour fills the lance round the cannon lobe, and at the top it goes on its own.",
    hand: [
      { k: "hold", at: [26, 128] },
      { k: "text", at: [44, 124], text: "tap: shot" },
      { k: "text", at: [44, 134], text: "hold: lance" },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1] },
        { event: "pointerup", marks: [9] },
      ],
      beats: [2, 4, 6, 8],
      window: { from: 1, to: 7, label: "three beats fill it" },
    },
    where: ["packages/sim/src/lance.ts"],
  },
  {
    name: "HOLD, AS A LEVEL",
    state: "built",
    does: "A thumb resting on a thing, worth something for every tick it stays. The game's commonest verb: the grip on a rock, THE WARDEN's tether, THE PULSE's bar.",
    hand: [
      { k: "body", at: [46, 50], r: 13 },
      { k: "hold", at: [46, 50] },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1] },
        { event: "pointermove", marks: [[1.2, 8.8]] },
        { event: "pointerup", marks: [9] },
      ],
      note: "worth something every tick between down and up",
    },
    where: ["packages/sim/src/grip.ts", "packages/sim/src/pulse-hand.ts"],
  },
  {
    name: "TIMED WHOLE-SCREEN HOLD",
    state: "built",
    does: "A thumb anywhere on the guide, held until a ring closes. Lifting early cancels; nothing on the field is aimed at.",
    hand: [
      { k: "zone", at: [4, 12], w: 84, h: 96, tone: "window" },
      { k: "hold", at: [46, 64] },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1] },
        { event: "pointerup", marks: [8] },
      ],
      window: { from: 1, to: 7, label: "ring closes" },
    },
    where: ["apps/game/src/briefing.ts"],
  },
  {
    name: "LETTING GO TOGETHER",
    state: "built",
    does: "Both seats hold a thumb on one body; what counts is both thumbs leaving the glass within one beat of each other. THE SURGE asks whether the pair can stop.",
    hand: [
      { k: "body", at: [46, 44], r: 20 },
      { k: "hold", at: [38, 48] },
      { k: "text", at: [16, 86], text: "both seats," },
      { k: "text", at: [16, 96], text: "lift together" },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1] },
        { event: "pointerdown", finger: 2, marks: [2] },
        { event: "pointerup", marks: [7] },
        { event: "pointerup", finger: 2, marks: [7.8] },
      ],
      beats: [3, 5, 7, 9],
      window: { from: 6.6, to: 8.4, label: "one beat" },
      note: "② is the other phone, across the wire",
    },
    where: ["packages/sim/src/surge.ts"],
  },
  {
    name: "TAP COUNT",
    state: "built",
    does: "Taps on one mark, counted: the number is said by one seat and struck by the other. A thumb held down is one tap, not one a tick.",
    hand: [
      { k: "body", at: [46, 52], r: 14 },
      { k: "touch", at: [40, 48], n: 1 },
      { k: "touch", at: [50, 56], n: 2 },
      { k: "touch", at: [46, 44], n: 3 },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1, 3.5, 6] },
        { event: "pointerup", marks: [1.8, 4.3, 6.8] },
      ],
      note: "the count is the downs",
    },
    where: ["packages/sim/src/instar-hand.ts", "packages/sim/src/beatbox-round.ts"],
  },
  {
    name: "TAP RHYTHM AGAINST THE BEAT",
    state: "built",
    does: "A tap once a beat, on the beat, for as many beats as asked — and the run is committed by stopping. THE BEATBOX; THE PULSE's arrows.",
    hand: [
      { k: "body", at: [46, 52], r: 14 },
      { k: "touch", at: [46, 52] },
      { k: "text", at: [22, 86], text: "on every beat" },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [2, 4, 6] },
        { event: "pointerup", marks: [2.6, 4.6, 6.6] },
      ],
      beats: [2, 4, 6, 8],
      window: { from: 7.6, to: 8.4, label: "no tap: committed" },
    },
    where: ["packages/sim/src/beatbox.ts", "packages/sim/src/pulse-hand.ts"],
  },
];
