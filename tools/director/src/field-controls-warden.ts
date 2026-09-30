import type { FieldControlDef } from "./field-control-def.js";
import { tetherExamples } from "./field-controls-tether.js";

/**
 * THE WARDEN's three hands, in a file of their own —
 * `field-controls-page.ts` is at its limit, the split every boss since THE
 * INSTAR has made. The rope was a generic row until 30 September 2026 and is
 * the first here now; its four looks are drawn by `field-controls-tether.ts`.
 *
 * Two targets on one circle, the eye shut where the pupil stands, and the
 * phase and the seat say which a press is (`sim/warden-hand.ts`,
 * `render/warden-grip.ts`): player 2's thumb rests on it under NARROW,
 * player 1's swipe throws the hatch under GLARE. Two rows because they are
 * two rings on two screens, each with a pose of its own
 * (`docs/spec/bosses.md` §11.4, *Three phases, three gestures*).
 */
export const WARDEN_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE WARDEN'S TETHER",
    where: "on the tether's resting circle, while one hangs from the rim",
    seat: "player 1 — the pilot pulls, player 2 keeps both colours",
    gesture: "grab and drag",
    does:
      "Pulls the line taut; held taut long enough it opens a hatch " +
      "(render/tether.ts, sim/config-boss.ts).",
    source: "touch.ts — wardenRopeUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "wardenTether",
    sends: ["drag"],
    pose: "TETHER · HELD TAUT",
    examples: tetherExamples,
  },
  {
    name: "THE WARDEN'S THUMB",
    where:
      "a ring on the shut eye, where the pupil stands, on player 2's screen " +
      "under NARROW — from the second plate off, with a halo under it; on " +
      "player 1's, the partner's turning ring and clock until her thumb is " +
      "down; on the test screen",
    seat: "player 2 only — the seat firing into an eye that will not show until she holds it",
    gesture: "hold",
    does:
      "Parts the lids behind the hatch and pins the pupil where it is for as " +
      "long as the thumb stays. The eye shows only while P1's rope is taut " +
      "and this thumb is down — both hands, then the shot, from the same " +
      "seat as the thumb (sim/warden-hand.ts). Player 1's press is refused, " +
      "red on the eye; her thumb landing is green.",
    source: "touch.ts — wardenGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "wardenEye",
    sends: ["drag"],
    pose: "THE WARDEN · NARROW",
  },
  {
    name: "THE WARDEN'S SWIPE",
    where:
      "a track across the eye on player 1's screen under GLARE — the last " +
      "plate, with no rope coming down — wardenThrowMilli out each side, " +
      "chevrons on it and a halo under it, filling green as the thumb " +
      "carries it; on player 2's, the partner's dashed bar and clock, and " +
      "the fill; on the test screen; a dial round the eye on both while " +
      "it is thrown",
    seat: "player 1 only — the seat whose rope is gone, given the door instead",
    gesture: "grab and drag",
    does:
      "Carried wardenThrowMilli of a tile and let go, the hatch is thrown " +
      "open for wardenThrowBeats — the dial on both screens is that count " +
      "running out — then slams. A lift short of the swipe throws nothing " +
      "and is refused, red on the eye, as is player 2's press; the throw is " +
      "green (sim/warden-hand.ts).",
    source:
      "touch.ts — wardenGripUnder() under handleUnder(); each move carries the travel " +
      "(hatchCarryMilli), warden-track.ts draws it",
    holdKind: "drag",
    dragTarget: "wardenHatch",
    sends: ["drag"],
    pose: "THE WARDEN · GLARE",
  },
];
