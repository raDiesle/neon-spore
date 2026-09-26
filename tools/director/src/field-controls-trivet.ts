import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE TRIVET's two feet, as rows of the ON THE FIELD tab.
 *
 * THE VISE's arrangement: **both screens draw the whole stand**, and whose
 * foot is whose is geometry — the front, splayed left, the pilot's, the
 * rear, splayed right, the navigator's. What is new is the gesture: the first
 * chord in the game, one finger a pad, counted by the order they land in by
 * `apps/game/src/chord.ts` and said by `render/chord.ts`
 * (`render/trivet-grip.ts`, `docs/spec/bosses-choreographed.md` §30).
 */
const FOOT_DOES =
  "A **chord**: fingers of the same seat laid in that seat's zone — its side " +
  "of the hub, the field's width, from the hub's crown to a tile under the " +
  "feet — and held. **Each finger is a pad, by the order it landed in**: the " +
  "first down is the first pad, the next the lowest pad no finger is on, and " +
  "each says its pad down as it lands and up as it lifts. The lit sockets say " +
  "how many fingers, never where. A lit chord step counts the beats every lit " +
  "pad stays down together and plants the foot when they run out; **a lit " +
  "pad lifting slips the chord** and the count starts again. A finger past the " +
  "last pad is nobody's. The stand takes a chord whenever it stands, until it " +
  "collapses (sim/trivet-hand.ts).";

export const TRIVET_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE TRIVET'S FRONT FOOT",
    where:
      "in the left half of the field from the stand's hub down to under its feet, on both screens, from the drop into frame until it collapses",
    seat: "player 1 — the front foot is the pilot's, by geometry, on both phones; a navigator's fingers there fall through",
    gesture: "chord",
    does: FOOT_DOES,
    source:
      "handles.ts — trivetPadUnder() under handleUnder(); the pads counted in apps/game/src/chord.ts",
    holdKind: "drag",
    dragTarget: "trivetPadFront",
    sends: ["drag"],
    pose: "TRIVET · THE FRONT FOOT CHORDED",
  },
  {
    name: "THE TRIVET'S REAR FOOT",
    where:
      "in the right half of the field from the stand's hub down to under its feet, on both screens, from the drop into frame until it collapses",
    seat: "player 2 — the rear foot is the navigator's, by geometry, on both phones; a pilot's fingers there fall through",
    gesture: "chord",
    does: FOOT_DOES,
    source:
      "handles.ts — trivetPadUnder() under handleUnder(); the pads counted in apps/game/src/chord.ts",
    holdKind: "drag",
    dragTarget: "trivetPadRear",
    sends: ["drag"],
    pose: "TRIVET · THE REAR FOOT CHORDED",
  },
];
