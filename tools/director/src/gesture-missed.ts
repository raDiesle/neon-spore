import type { Gesture } from "./gesture-types.js";

/**
 * What the game does not read, **on purpose** — each with the reason, which is
 * the point of drawing it: an idea for a new boss that needs one of these is
 * answered here before it is written up. The same list in prose is §4.4 of
 * `docs/spec/transfers-touch.md`. The microphone is not drawn; rule 5 is not
 * an argument.
 */

export const STAY_MISSED: readonly Gesture[] = [
  {
    name: "PRESSURE",
    state: "missed",
    does: "How hard the finger presses, as a level.",
    hand: [
      { k: "hold", at: [46, 52] },
      { k: "text", at: [24, 84], text: "harder…" },
    ],
    timeline: {
      lanes: [
        { event: "touchstart", marks: [1] },
        { event: "touchmove", marks: [[1.3, 8]] },
        { event: "touchend", marks: [8.5] },
      ],
      note: "touch.force: 0 on every iPhone since 2019",
    },
    why: "It would split the pair by device: nothing on an iPhone, uneven on Android.",
  },
  {
    name: "SWIPE IN FROM THE EDGE",
    state: "missed",
    does: "A drag that starts at the physical edge of the screen.",
    hand: [
      { k: "zone", at: [0, 0], w: 8, h: 154, tone: "os" },
      { k: "zone", at: [0, 146], w: 92, h: 8, tone: "os" },
      {
        k: "path",
        pts: [
          [3, 60],
          [40, 60],
        ],
      },
      { k: "cross", at: [60, 60] },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1] },
        { event: "pointermove", marks: [[1.3, 3]] },
        { event: "pointercancel", marks: [3.2] },
      ],
      note: "the OS takes it: back, home, notifications",
    },
    why: "The outer ~20 px and the home strip belong to the OS; the game gets a cancel.",
  },
  {
    name: "THREE FINGERS, TRIPLE TAP",
    state: "missed",
    does: "Three fingers at once, or three taps in quick succession.",
    hand: [
      { k: "touch", at: [30, 52] },
      { k: "touch", at: [46, 44] },
      { k: "touch", at: [62, 52] },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [2] },
        { event: "pointerdown", finger: 2, marks: [2.2] },
        { event: "pointercancel", marks: [3] },
      ],
      note: "iOS accessibility answers first",
    },
    why: "Collides with iOS zoom and undo gestures, and a hand on a call has one thumb free.",
  },
  {
    name: "FLICK, BY SPEED",
    state: "missed",
    does: "A fast swipe whose speed is the value, not its distance.",
    hand: [
      {
        k: "path",
        pts: [
          [20, 80],
          [74, 30],
        ],
      },
      { k: "text", at: [8, 100], text: "fast = strong?" },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [3] },
        { event: "pointermove", marks: [[3.2, 4]] },
        { event: "pointerup", marks: [4.2] },
      ],
    },
    why: "Speed depends on the device, and on the wire a speed is an increment: a lost move no longer heals. A swipe past a distance does the job.",
  },
  {
    name: "TWO-FINGER ROTATE",
    state: "missed",
    does: "Two fingers twisting round each other, like turning a dial.",
    hand: [
      { k: "arc", c: [46, 52], r: 20, from: 300, to: 380 },
      { k: "arc", c: [46, 52], r: 20, from: 120, to: 200 },
    ],
    timeline: {
      lanes: [
        { event: "gesturechange", marks: [[1.5, 8]] },
        { event: "pointermove", marks: [[1.5, 8]] },
      ],
      note: "gesturechange: iPhone only",
    },
    why: "One finger round a circle does it better, with one hand, and it is already built.",
  },
  {
    name: "FACE DOWN",
    state: "missed",
    does: "The phone turned over on the table.",
    hand: [],
    phone: { faceDown: true },
    timeline: {
      lanes: [{ event: "deviceorientation", marks: [[1, 9]] }],
      note: "beta near 180°",
    },
    why: "The player can no longer see their half of the picture — and that half is the game.",
  },
  {
    name: "HOLD THE PHONE STILL",
    state: "missed",
    does: "Keep the phone motionless for a while.",
    hand: [{ k: "text", at: [26, 60], text: "still…" }],
    timeline: {
      lanes: [{ event: "devicemotion", marks: [[1, 9]] }],
      note: "a missing sensor also reads as still",
    },
    why: "Sensor noise, a refused permission and no sensor at all look the same as stillness. SENDING NOTHING is the honest version.",
  },
  {
    name: "LONG PRESS, THE OS's WAY",
    state: "missed",
    does: "A hold the browser answers itself: a context menu, a text selection, a magnifier.",
    hand: [
      { k: "hold", at: [46, 52] },
      { k: "zone", at: [30, 64], w: 46, h: 30, tone: "os" },
      { k: "cross", at: [53, 79] },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1] },
        { event: "contextmenu", marks: [6] },
        { event: "selectstart", marks: [6.2] },
        { event: "pointercancel", marks: [6.4] },
      ],
      note: "refused in input.ts; iPhone's callout is queued",
    },
    why: "Every hold in the game would be broken by it. It is refused, not read.",
    platform: "Android sends contextmenu; an iPhone shows a callout that CSS must suppress.",
  },
];
