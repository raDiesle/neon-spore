import type { FieldAction } from "./field-actions.js";

/**
 * Every action on CONTROLS › ON THE FIELD but GRAB AND DRAG
 * (`field-actions-drag.ts`). Split from `field-actions.ts` for length; the
 * page sorts them by use, not by this order.
 *
 * Four rows are filed where the owner put them on 6 October 2026 rather than
 * where their old family had them: THE HIVE's wring is HOLD ENEMY FOR AUTO AIM
 * CANNON, THE PULSE's brace a simple PRESS, THE VANE's arm a regular HOLD, and
 * THE CHOIR's two arrows one SHAKE. THE SCOUT's prime joined HOLD on 10
 * October 2026, when the owner called it one and the game was made to agree.
 * THE FLEET's rake joined it the same day: filed as a TRACE, it marks only
 * while her thumb is on the plume and the wreck sinks only while his is still
 * on the hull, so it is BOTH SEATS HOLDING AT ONCE with a thumb that slides.
 *
 * STEP BY STEP is gone the same day: the owner called it how a control is
 * used, not a kind of action. Its four rows — one mark whose gesture changes
 * step by step — are filed under every type a step of them uses, each with
 * its `steps` line, here and in `field-actions-drag.ts`.
 */
export const OTHER_ACTIONS: readonly FieldAction[] = [
  {
    key: "hold",
    title: "HOLD",
    says: "A finger put on one thing and kept there; the lift is the end of it.",
    gestures: ["HOLD, AS A LEVEL"],
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
          "THE SCOUT'S PRIME",
          "THE QUEEN'S MARKS",
        ],
        steps: {
          "THE QUEEN'S MARKS": "SCREAM — the real mark held open, up to its beats.",
        },
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
        gestures: ["BOTH SEATS IN ONE WINDOW", "LETTING GO TOGETHER"],
        rows: [
          "THE BATON'S DRAW",
          "THE PULSE'S ARREST",
          "THE OCULUS'S LEFT LEAF",
          "THE OCULUS'S RIGHT LEAF",
          "THE FLEET'S RAKE",
          "THE INSTAR'S MARKS",
          "THE MIRROR'S LOBES",
          "THE WARDEN'S THUMB",
        ],
        steps: {
          "THE INSTAR'S MARKS": "HOLD BOTH — both thumbs on a middle mark for its beats.",
          "THE MIRROR'S LOBES": "THE PIN — one seat on its cannon, the other on its shield.",
        },
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
    says:
      "A finger put down and lifted again. A tap and a press are one gesture " +
      "here: the press is the down, and the lift only ends it.",
    gestures: ["TAP"],
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
        gestures: ["FREEZE TAP", "TAP RHYTHM AGAINST THE BEAT"],
        rows: [
          "THE VALVE'S PIN",
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
        gestures: ["TAP COUNT", "TAPS ON A MOVING TARGET"],
        rows: [
          "THE PULSE'S BRACE",
          "THE MANTLE'S CORE",
          "THE KEEL'S JOINT",
          "THE RATCHET'S PAWL",
          "THE BATON'S STRIP",
          "THE GORGE'S TAP",
          "THE LIGHT",
          "THE TRAPEZE'S ALIEN",
          "THE INSTAR'S MARKS",
          "THE MIRROR'S LOBES",
          "THE QUEEN'S MARKS",
          "THE GALL'S TAPS AND PULL",
        ],
        steps: {
          "THE INSTAR'S MARKS": "TAP TAP — every grab on the mark is one slap.",
          "THE MIRROR'S LOBES": "THE LAST ROUND — a tap on its cannon, a press on its shield.",
          "THE QUEEN'S MARKS": "BROOD — a press on the real mark opens it.",
          "THE GALL'S TAPS AND PULL": "THE TAPS — each one winds the alien a turn tighter.",
        },
      },
    ],
  },
  {
    key: "shake",
    title: "SHAKE",
    says:
      "Shake the phone — or, on a phone that cannot tell or on a computer, " +
      "swipe outward on one side and then the other.",
    gestures: ["SHAKE"],
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
];
