import type { FieldAction } from "./field-actions.js";

/**
 * Every action on CONTROLS › ON THE FIELD but GRAB AND DRAG
 * (`field-actions-drag.ts`). Split from `field-actions.ts` for length; the
 * page sorts them by use, not by this order.
 *
 * Four rows are filed where the owner put them on 6 October 2026 rather than
 * where their old family had them: THE HIVE's wring is HOLD ENEMY FOR AUTO AIM
 * CANNON, THE PULSE's brace a simple PRESS, THE VANE's arm a regular HOLD, and
 * THE CHOIR's two arrows one SHAKE.
 */
export const OTHER_ACTIONS: readonly FieldAction[] = [
  {
    key: "hold",
    title: "HOLD",
    says: "A finger put on one thing and kept there; the lift is the end of it.",
    types: [
      {
        key: "hold",
        title: "HOLD",
        says:
          "A thumb resting on one thing stops something happening for as long " +
          "as it stays. Nothing is carried; the only value is whether it is down.",
        suggest:
          "Make it one generic PIN: GRIP's own gesture and picture on a boss's " +
          "part. Pick one answer for the lift — a pause, or a pin — per type, " +
          "not per boss, and draw it.",
        rows: [
          "THE SURGE'S BULB",
          "THE ANTIPHON'S ORGAN",
          "THE GAUGE'S BAND",
          "THE LEAD'S STALK",
          "THE WELL'S SEAM",
          "THE VANE'S ARM",
          "THE LEDGER'S PLUG",
          "THE FLEET'S PLUME",
          "THE LAMPREY'S TAIL",
        ],
      },
      {
        key: "both",
        title: "BOTH SEATS HOLDING AT ONCE",
        says:
          "A hold that counts only while both seats have a thumb down, on two " +
          "phones — neither can feel the other's.",
        suggest:
          "Make the together-mark generic: one ring on both screens that fills " +
          "only while both are down, the same on every boss that asks it.",
        rows: [
          "THE BATON'S DRAW",
          "THE PULSE'S ARREST",
          "THE OCULUS'S LEFT LEAF",
          "THE OCULUS'S RIGHT LEAF",
        ],
      },
      {
        key: "autoaim",
        title: "HOLD ENEMY FOR AUTO AIM CANNON",
        says: "A thumb held on the enemy's own body, not on a handle beside it.",
        rows: ["THE HIVE'S WRING"],
      },
    ],
  },
  {
    key: "press",
    title: "PRESS",
    says: "A finger put down and lifted again.",
    types: [
      {
        key: "timed",
        title: "TAP ON THE MARK, IN TIME",
        says:
          "A press read on the tick it lands and never after; a resting thumb " +
          "has to lift and come down again. Timed against a mark.",
        suggest:
          "Make it generic under THE VALVE's pin, with one skid and one ring. " +
          "Six of these already say 'THE VALVE's pin' in their own text.",
        rows: [
          "THE VALVE'S PIN",
          "THE CYST'S LEFT FREEZE MARK",
          "THE CYST'S RIGHT FREEZE MARK",
          "THE GOVERNOR'S NEEDLE",
          "THE TASTER'S PIN",
          "THE LAMPREY'S TEETH",
          "THE UNDERTOW'S TAP",
        ],
      },
      {
        key: "press",
        title: "PRESS",
        says: "Presses on one place, counted, or taken in turn by seat.",
        suggest:
          "Keep specific, but one refusal: THE MANTLE and THE KEEL refuse the " +
          "wrong seat silently, where most of the game refuses it red.",
        rows: [
          "THE PULSE'S BRACE",
          "THE MANTLE'S CORE",
          "THE KEEL'S JOINT",
          "THE RATCHET'S PAWL",
          "THE BATON'S STRIP",
          "THE GORGE'S TAP",
          "THE LIGHT",
          "THE TRAPEZE'S ALIEN",
        ],
      },
    ],
  },
  {
    key: "chord",
    title: "CHORD",
    says: "Several fingers of one seat down at once.",
    types: [
      {
        key: "chord",
        title: "CHORD",
        says: "Fingers held at once, each a pad by the order it landed (`chord-pads.ts`).",
        suggest: "Already one helper. Make the pads' picture generic.",
        rows: [
          "THE TRIVET'S FRONT FOOT",
          "THE TRIVET'S REAR FOOT",
          "THE HALTER'S LEFT GRIP",
          "THE HALTER'S RIGHT GRIP",
          "THE GRINDSTONE'S LEFT JAW",
          "THE GRINDSTONE'S RIGHT JAW",
        ],
      },
    ],
  },
  {
    key: "pinch",
    title: "PINCH",
    says: "Two fingers of one seat closing on a body.",
    types: [
      {
        key: "squeeze",
        title: "SQUEEZE",
        says: "Two fingers of one seat, closed on a body; the gap is the depth.",
        suggest: "Already one gesture, THE VISE's. Make its zone and its picture generic.",
        rows: [
          "THE VISE'S LEFT LOBE",
          "THE VISE'S RIGHT LOBE",
          "THE GALL'S PRESS",
          "THE CYST'S LEFT FLANK",
          "THE CYST'S RIGHT FLANK",
        ],
      },
    ],
  },
  {
    key: "shake",
    title: "SHAKE",
    says:
      "Shake the phone — or, on a phone that cannot tell or on a computer, " +
      "swipe outward on one side and then the other.",
    types: [
      {
        key: "shake",
        title: "SHAKE",
        says:
          "Both ways are offered always: the shake itself, and an arrow against " +
          "each wall of the field marked SWIPE (`apps/game/src/shake.ts`, " +
          "`render/choir-arrows.ts`).",
        rows: ["THE CHOIR'S LEFT ARROW", "THE CHOIR'S RIGHT ARROW"],
      },
    ],
  },
  {
    key: "script",
    title: "STEP BY STEP",
    says: "One mark whose gesture changes step by step.",
    types: [
      {
        key: "script",
        title: "ONE MARK, MANY GESTURES",
        says: "One target whose gesture changes step by step, each borrowed from another action.",
        suggest:
          "Keep specific: these are scripts, not verbs. Each step should use the " +
          "generic control it borrows, once that exists.",
        rows: ["THE INSTAR'S MARKS", "THE MIRROR'S LOBES", "THE QUEEN'S MARKS"],
      },
    ],
  },
];
